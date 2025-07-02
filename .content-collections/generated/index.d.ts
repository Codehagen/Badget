import configuration from "../../content-collections.ts";
import { GetTypeByName } from "@content-collections/core";

export type Blog = GetTypeByName<typeof configuration, "blog">;
export declare const allBlogs: Array<Blog>;

export type Help = GetTypeByName<typeof configuration, "help">;
export declare const allHelps: Array<Help>;

export {};
