import { inject, injectable } from 'inversify';
import { DocumentType, types } from '@typegoose/typegoose';

import { Component } from '../../types/index.js';
import type { OfferServiceInterface } from './offer-service.interface.js';
import { OfferEntity } from './offer.entity.js';
import type { LoggerInterface } from '../../libs/logger/logger.interface.js';
import { SortType } from '../../types/index.js';
import { CreateOfferDto } from '../dto/create-offer.dto.js';
import { UpdateOfferDto } from '../dto/update-offer.dto.js';

enum DefaultCount {
  Offer = 60,
  Premiun = 3,
}

@injectable()
export class DefaultOfferService implements OfferServiceInterface {
  constructor(
    @inject(Component.Logger) private readonly logger: LoggerInterface,
    @inject(Component.OfferModel)
    private readonly offerModel: types.ModelType<OfferEntity>
  ) {}

  public async create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>> {
    const result = await this.offerModel.create(dto);
    this.logger.info(`New offer created: ${dto.name}`);

    return result;
  }

  public async findById(
    offerId: string
  ): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel.findById(offerId).populate(['userId']).exec();
  }

  public async deleteById(
    offerId: string
  ): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel.findByIdAndDelete(offerId).exec();
  }

  public async updateById(
    offerId: string,
    dto: UpdateOfferDto
  ): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findByIdAndUpdate(offerId, dto, { new: true })
      .populate(['userId'])
      .exec();
  }

  public async incCommentCount(
    offerId: string
  ): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findByIdAndUpdate(offerId, {
        $inc: {
          comments: 1,
        },
      })
      .exec();
  }

  public async addRating(
    offerId: string,
    rating: number
  ): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findByIdAndUpdate(offerId, {
        $push: { ratings: rating },
      })
      .exec();
  }

  public async find(
    count = DefaultCount.Offer
  ): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find()
      .sort({ date: SortType.Dec })
      .limit(count)
      .populate(['userId'])
      .exec();
  }

  public async findFavorites(
    userId: string
  ): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find({ isFavorite: true, userId: userId })
      .populate(['userId'])
      .exec();
  }

  public async toggleIsFavorite(_userId: string, offerId: string) {
    try {
      const offer = await this.offerModel
        .findById(offerId)
        .populate(['userId'])
        .exec();
      if (offer) {
        offer.isFavorite = !offer.isFavorite;
        return offer.save();
      } else {
        throw new Error('Offer not found');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async exists(documentId: string): Promise<boolean> {
    return (await this.offerModel.exists({ _id: documentId })) !== null;
  }

  public async findPremium(
    cityName: string
  ): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find({ isPremium: true, city: cityName })
      .sort({ date: SortType.Dec })
      .limit(DefaultCount.Premiun)
      .populate(['userId'])
      .exec();
  }

  public async countRatingById(offerId: string): Promise<number | null> {
    const offer = await this.offerModel
      .findById(offerId)
      .populate(['userId'])
      .exec();
    const entity = offer?.toObject();
    entity?.setRating();
    return entity?.rating || null;
  }
}
