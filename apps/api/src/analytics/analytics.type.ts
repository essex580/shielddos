import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class AggregatedMetric {
    @Field()
    name: string;

    @Field(() => Int)
    value: number;
}

@ObjectType()
export class GeoMetric {
    @Field()
    country: string;

    @Field(() => Int)
    count: number;
}

@ObjectType()
export class DashboardAnalytics {
    @Field(() => Int)
    totalRequests: number;

    @Field(() => Int)
    blockedRequests: number;

    @Field(() => Int)
    activeTarpits: number;

    @Field(() => Int)
    cacheHits: number;

    @Field(() => Int)
    cacheMisses: number;

    @Field(() => [AggregatedMetric])
    topIps: AggregatedMetric[];

    @Field(() => [GeoMetric])
    topCountries: GeoMetric[];

    @Field(() => [AggregatedMetric])
    trafficDistribution: AggregatedMetric[];
}
