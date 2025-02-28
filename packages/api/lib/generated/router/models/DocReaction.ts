/* istanbul ignore file */
/* eslint-disable */

import type { Emote } from "./Emote";

export type DocReaction = {
    /**
     * The ID of the channel
     */
    channelId: string;
    /**
     * The ID of the user who added the reaction
     */
    createdBy: string;
    emote: Emote;
    /**
     * The ID of the doc
     */
    docId: number;
};
