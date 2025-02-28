/* istanbul ignore file */
/* eslint-disable */
import type { ServerSubscriptionTier } from "../models/ServerSubscriptionTier";

import type { CancelablePromise } from "../core/CancelablePromise";
import type { BaseHttpRequest } from "../core/BaseHttpRequest";

export class ServerSubscriptionService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Get a server subscription tier
     * @returns any Success
     * @throws ApiError
     */
    public serverSubscriptionTierRead({ serverId, serverSubscriptionTierType }: { serverId: string; serverSubscriptionTierType: "Gold" | "Silver" | "Copper" }): CancelablePromise<{
        serverSubscriptionTier: ServerSubscriptionTier;
    }> {
        return this.httpRequest.request({
            method: "GET",
            url: "/servers/{serverId}/subscriptions/tiers/{serverSubscriptionTierType}",
            path: {
                serverId: serverId,
                serverSubscriptionTierType: serverSubscriptionTierType,
            },
        });
    }

    /**
     * Get server subscription tiers
     * @returns any Success
     * @throws ApiError
     */
    public serverSubscriptionTierReadMany({ serverId }: { serverId: string }): CancelablePromise<{
        serverSubscriptionTiers: Array<ServerSubscriptionTier>;
    }> {
        return this.httpRequest.request({
            method: "GET",
            url: "/servers/{serverId}/subscriptions/tiers",
            path: {
                serverId: serverId,
            },
        });
    }
}
