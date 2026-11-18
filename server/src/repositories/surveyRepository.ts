import { FilterQuery, Types } from 'mongoose';
import Survey from '../models/Survey';
import { ISurvey, PaginatedResult, PaginationParams } from '../types';

export class SurveyRepository {
  async create(surveyData: Partial<ISurvey>): Promise<ISurvey> {
    const survey = await Survey.create(surveyData);
    return survey.toObject();
  }

  async findById(id: string | Types.ObjectId): Promise<ISurvey | null> {
    return Survey.findOne({ _id: id, isActive: true }).lean();
  }

  async findByIdRaw(id: string | Types.ObjectId): Promise<ISurvey | null> {
    return Survey.findById(id).lean();
  }

  async findAllActive(): Promise<ISurvey[]> {
    return Survey.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  }

  async findWithPagination(params: PaginationParams): Promise<PaginatedResult<ISurvey>> {
    const { page = 1, limit = 10, status, category, search, creatorId } = params;

    const query: FilterQuery<ISurvey> = { isActive: true };

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (creatorId) {
      query.creatorId = new Types.ObjectId(creatorId);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Survey.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Survey.countDocuments(query)
    ]);

    return {
      data,
      total,
      page,
      limit
    };
  }

  async update(id: string | Types.ObjectId, updateData: Partial<ISurvey>): Promise<ISurvey | null> {
    return Survey.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
  }

  async softDelete(id: string | Types.ObjectId): Promise<boolean> {
    const result = await Survey.updateOne(
      { _id: id, isActive: true },
      { $set: { isActive: false, status: 'archived' } }
    );
    return result.modifiedCount > 0;
  }

  async hardDelete(id: string | Types.ObjectId): Promise<boolean> {
    const result = await Survey.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async incrementResponseCount(id: string | Types.ObjectId): Promise<void> {
    await Survey.updateOne({ _id: id }, { $inc: { responseCount: 1 } });
  }
}

export const surveyRepository = new SurveyRepository();
export default surveyRepository;
