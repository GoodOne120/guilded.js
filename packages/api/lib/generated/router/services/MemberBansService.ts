/* istanbul ignore file */
/* eslint-disable */
import type { ServerMemberBan } from "../models/ServerMemberBan";

import type { CancelablePromise } from "../core/CancelablePromise";
import type { BaseHttpRequest } from "../core/BaseHttpRequest";

export class MemberBansService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Create a server ban
     * Also known as banning a server member
     * @returns any Success
     * @throws ApiError
     */
    public serverMemberBanCreate({
        serverId,
        userId,
        requestBody,
    }: {
        serverId: string;
        /**
         * The ID of the user to ban from this server
         */
        userId: string | "@me";
        requestBody?: {
            /**
             * The reason for the ban
             */
            reason?: string;
        };
    }): CancelablePromise<{
        serverMemberBan: ServerMemberBan;
    }> {
        return this.httpRequest.request({
            method: "POST",
            url: "/servers/{serverId}/bans/{userId}",
            path: {
                serverId: serverId,
                userId: userId,
            },
            body: requestBody,
            mediaType: "application/json",
        });
    }

    /**
     * Get a server ban
     * @returns any Success
     * @throws ApiError
     */
    public serverMemberBanRead({
        serverId,
        userId,
    }: {
        serverId: string;
        /**
         * The ID of the user to get a server ban for
         */
        userId: string | "@me";
    }): CancelablePromise<{
        serverMemberBan: ServerMemberBan;
    }> {
        return this.httpRequest.request({
            method: "GET",
            url: "/servers/{serverId}/bans/{userId}",
            path: {
                serverId: serverId,
                userId: userId,
            },
        });
    }

    /**
     * Delete a server ban
     * Also known as unbanning a server member
     * @returns void
     * @throws ApiError
     */
    public serverMemberBanDelete({
        serverId,
        userId,
    }: {
        serverId: string;
        /**
         * The ID of the user to unban from this server
         */
        userId: string | "@me";
    }): CancelablePromise<void> {
        return this.httpRequest.request({
            method: "DELETE",
            url: "/servers/{serverId}/bans/{userId}",
            path: {
                serverId: serverId,
                userId: userId,
            },
        });
    }

    /**
     * Get server bans
     * @returns any Success
     * @throws ApiError
     */
    public serverMemberBanReadMany({ serverId }: { serverId: string }): CancelablePromise<{
        serverMemberBans: Array<ServerMemberBan>;
    }> {
        return this.httpRequest.request({
            method: "GET",
            url: "/servers/{serverId}/bans",
            path: {
                serverId: serverId,
            },
        });
    }
}
