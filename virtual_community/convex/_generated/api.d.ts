/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activity_log from "../activity_log.js";
import type * as answers from "../answers.js";
import type * as chains_answerChain from "../chains/answerChain.js";
import type * as chains_client from "../chains/client.js";
import type * as chains_replyChain from "../chains/replyChain.js";
import type * as chains_topicVectorChain from "../chains/topicVectorChain.js";
import type * as personas from "../personas.js";
import type * as questions from "../questions.js";
import type * as replies from "../replies.js";
import type * as simulation from "../simulation.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activity_log: typeof activity_log;
  answers: typeof answers;
  "chains/answerChain": typeof chains_answerChain;
  "chains/client": typeof chains_client;
  "chains/replyChain": typeof chains_replyChain;
  "chains/topicVectorChain": typeof chains_topicVectorChain;
  personas: typeof personas;
  questions: typeof questions;
  replies: typeof replies;
  simulation: typeof simulation;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
