import { EventEmitter } from "node:events";
import type { Collection } from "@discordjs/collection";
import { RestManager, WebSocketManager } from "@guildedjs/api";
import type { SkeletonWSPayload } from "@guildedjs/api";
import type TypedEmitter from "typed-emitter";
import type { CacheStructure } from "../cache";
import { ClientGatewayHandler } from "../gateway/ClientGatewayHandler";
import { GlobalCalendarManager } from "../managers/global/CalendarManager";
import { GlobalChannelManager } from "../managers/global/ChannelManager";
import { GlobalDocManager } from "../managers/global/DocManager";
import { GlobalForumTopicManager } from "../managers/global/ForumManager";
import { GlobalGroupManager } from "../managers/global/GroupManager";
import { GlobalGuildBanManager } from "../managers/global/GuildBanManager";
import { GlobalListItemManager } from "../managers/global/ListManager";
import { GlobalMemberManager } from "../managers/global/MemberManager";
import { GlobalMessageManager } from "../managers/global/MessageManager";
import { GlobalReactionManager } from "../managers/global/ReactionManager";
import { GlobalRoleManager } from "../managers/global/RoleManager";
import { GlobalServerManager } from "../managers/global/ServerManager";
import { GlobalSubscriptionManager } from "../managers/global/SubscriptionManager";
import { GlobalUserManager } from "../managers/global/UserManager";
import { GlobalWebhookManager } from "../managers/global/WebhookManager";
import type { ClientEvents } from "../typings";
import type { Server } from "./Server";
import { ClientUser } from "./User";

/**
 * The main class for interacting with the api.
 *
 * @template ClientEvents The custom events for the client.
 */
export class Client extends (EventEmitter as unknown as new () => TypedEmitter<ClientEvents>) {
    /**
     * The time in milliseconds since the Client connected.
     */
    readyTimestamp: number | null = null;

    /**
     * The manager for the bot to make requests to the REST api.
     */
    rest = new RestManager({
        ...this.options.rest,
        token: this.options.token,
    });

    /**
     * The websocket connection.
     */
    ws = new WebSocketManager({ token: this.options.token });

    /**
     * The gateway events will be processed by this manager.
     */
    gatewayHandler = new ClientGatewayHandler(this);

    /**
     * A manager for channels, used to manage and interact with channels.
     */
    channels = new GlobalChannelManager(this);

    /**
     * A manager for docs, used to manage and interact with docs.
     */
    docs = new GlobalDocManager(this);

    /**
     * A manager for forum topics, used to manage and interact with forum topics.
     */
    topics = new GlobalForumTopicManager(this);

    /**
     * A manager for groups, used to manage and interact with groups.
     */
    groups = new GlobalGroupManager(this);

    /**
     * A manager for list items, used to manage and interact with list items.
     */
    lists = new GlobalListItemManager(this);

    /**
     * A manager for members, used to manage and interact with members.
     */
    members = new GlobalMemberManager(this);

    /**
     * A manager for messages, used to manage and interact with messages.
     */
    messages = new GlobalMessageManager(this);

    /**
     * A manager for roles, used to manage and interact with roles.
     */
    roles = new GlobalRoleManager(this);

    /**
     * A manager for users, used to manage and interact with users.
     */
    users = new GlobalUserManager(this);

    /**
     * A manager for guild bans, used to manage and interact with bans.
     */
    bans = new GlobalGuildBanManager(this);

    /**
     * A manager for webhooks, used to manage and interact with webhooks.
     */
    webhooks = new GlobalWebhookManager(this);

    /**
     * A manager for servers, used to manage and interact with servers.
     */
    servers = new GlobalServerManager(this);

    /**
     * A manager for reactions, used to manage and interact with reactions.
     */
    reactions = new GlobalReactionManager(this);

    /**
     * A manager for calendars, used to manage and interact with calendars.
     */
    calendars = new GlobalCalendarManager(this);

    /**
     * A manager for server subscriptions, used to manage and interact with server subscriptions.
     */
    subscriptions = new GlobalSubscriptionManager(this);

    /**
     * The user belonging to this bot.
     */
    user: ClientUser | null = null;

    /**
     * @param options The options for the client.
     * @throws {Error} Must provide options in client constructor in the form of an object.
     * @throws {Error} No token provided.
     */
    constructor(public options: ClientOptions) {
        // eslint-disable-next-line constructor-super
        super();
        if (typeof options !== "object") throw new Error("Must provide options in client constructor in the form of an object.");
        if (typeof options?.token === "undefined") throw new Error("No token provided.");
    }

    /**
     * The amount of time the bot has been online in milliseconds.
     */
    get uptime(): number {
        return this.readyTimestamp ? Date.now() - this.readyTimestamp : 0;
    }

    /**
     * The bot's token.
     */
    get token(): string {
        return this.options.token;
    }

    /**
     * Connects the bot to the api.
     *
     * @param [opts] The options for connecting to the api.
     * @param [opts.fresh] Whether this should create a new WebSocketManager instance.
     * @example
     * let client = new Guilded.Client({ token: process.env.GUILDED_TOKEN });
     * client.on('ready', () => console.log('Logged in!'));
     * client.login();
     */
    login(opts?: { fresh?: boolean }): void {
        if (opts?.fresh) this.ws = new WebSocketManager({ token: this.options.token });
        this.ws.emitter
            .on("error", (reason, err) => this.emit("error", `[WS] ${reason}`, err))
            .on("ready", (user) => {
                this.user = new ClientUser(this, user);
                this.readyTimestamp = Date.now();
                this.emit("ready");
            })
            .on("gatewayEvent", (event, data) => this.gatewayHandler.handleWSMessage(event, data))
            .on("debug", (data) => this.emit("debug", data))
            .on("exit", () => this.emit("exit"));
        this.ws.connect();
    }

    /**
     * Disconnects the bot.
     *
     * @throws {Error} There is no active connection to disconnect.
     */
    disconnect(): void {
        if (!this.ws.isAlive) throw new Error("There is no active connection to disconnect.");
        this.ws.emitter.removeAllListeners();
        this.ws.destroy();
        this.emit("exit");
    }

    /**
     * Fetches the logged in client's servers.
     *
     * @returns The logged in client's servers.
     */
    fetchServers(): Promise<Collection<string, Server>> {
        return this.users.fetchServers(this.user!.id);
    }

    /**
     * Set current logged in client's status
     *
     * @param options The options for setting the status.
     * @param options.content The content of the status.
     * @param options.emoteId The id of the emote to use for the status.
     * @param options.expiresAt The time the status should expire.
     */
    async setStatus(options: { content?: string; emoteId: number; expiresAt?: Date | number | string }): Promise<void> {
        let resolvedDate;
        if (options.expiresAt instanceof Date) {
            resolvedDate = options.expiresAt;
        } else if (typeof options.expiresAt === "string") {
            resolvedDate = new Date(options.expiresAt);
        } else if (typeof options.expiresAt === "number") {
            resolvedDate = new Date(Date.now() + options.expiresAt);
        }

        await this.rest.router.userStatus.userStatusCreate({
            userId: this.user!.id,
            requestBody: {
                content: options.content,
                emoteId: options.emoteId,
                expiresAt: resolvedDate?.toISOString() ?? undefined,
            },
        });
    }

    /**
     * Clear current logged in client's status
     */
    async clearStatus(): Promise<void> {
        await this.rest.router.userStatus.userStatusDelete({
            userId: this.user!.id,
        });
    }
}

/**
 * Options for constructing the client.
 */
export type ClientOptions = {
    /**
     * The bot's token.
     *
     * @remarks The token is required to authenticate with the Guilded API.
     */
    token: string;

    /**
     * The RestManager options.
     */
    rest?: {
        /**
         * The version of the API to be used for making requests. By default, this will use the latest version that the library supports.
         *
         * @default 1
         * @remarks You can set the API version to 1 if you want to use the stable API.
         */
        version?: 1;

        /**
         * The base url of the API you want to send requests to. By default, this will send it to guilded's rest API.
         * This is meant for big bot developers who want to use a proxy rest system.
         *
         * @remarks If you want to use a custom API url, you can set this property to your custom url.
         */
        proxyURL?: string;
    };

    /**
     * Gateway handling options
     */
    gateway?: {
        /**
         * A boolean returning function that dictates whether an event is discarded
         */
        discardEvent?(event: string, data: SkeletonWSPayload): boolean;
    };

    /**
     * The cache options for the client.
     */
    cache?: {
        /**
         * The function to create a new instance of CacheStructure.
         *
         * @remarks You can use this to provide your own implementation of CacheStructure, which will be used to cache data in the client in a future update.
         */
        structureBuilder?<K, V>(): CacheStructure<K, V>;

        /**
         * Whether to fetch the author of a message when it is created and cache it.
         *
         * @default false
         */
        fetchMessageAuthorOnCreate?: boolean;

        /**
         * Whether to remove a member from the cache when they leave a server.
         *
         * @default true
         */
        removeMemberOnLeave?: boolean;

        /**
         * Whether to remove a member's ban from the cache when they are unbanned.
         *
         * @default true
         */
        removeMemberBanOnUnban?: boolean;

        /**
         * Whether to remove a channel from the cache when it is deleted.
         *
         * @default true
         */
        removeChannelOnDelete?: boolean;

        /**
         * Whether to remove a calendar from the cache when it is deleted.
         *
         * @default true
         */
        removeCalendarsOnDelete?: boolean;

        /**
         * Whether to remove a calendar RSVP from the cache when it is deleted.
         *
         * @default true
         */
        removeCalendarRsvpOnDelete?: boolean;

        /**
         * Whether to cache member bans.
         *
         * @default true
         */
        cacheMemberBans?: boolean;

        /**
         * Whether to cache webhooks.
         *
         * @default true
         */
        cacheWebhooks?: boolean;

        /**
         * Whether to cache channels.
         *
         * @default true
         */
        cacheChannels?: boolean;

        /**
         * Whether to cache servers.
         *
         * @default true
         */
        cacheServers?: boolean;

        /**
         * Whether to cache messages.
         *
         * @default true
         */
        cacheMessages?: boolean;

        /**
         * Whether to cache forum topics.
         *
         * @default true
         */
        cacheForumTopics?: boolean;

        /**
         * Whether to cache message reactions.
         *
         * @default true
         */
        cacheMessageReactions?: boolean;

        /**
         * Whether to cache calendars.
         *
         * @default true
         */
        cacheCalendars?: boolean;

        /**
         * Whether to cache calendar RSVPs.
         *
         * @default true
         */
        cacheCalendarsRsvps?: boolean;

        /**
         * Whether to cache member social links.
         *
         * @default true
         */
        cacheSocialLinks?: boolean;
    };
};
