declare module 'taskcluster-client-web' {
  export class Hooks {
    constructor(options: {
      rootUrl: string;
      credentials: { clientId: string; accessToken: string };
    });
    triggerHook(
      hookGroupId: string,
      hookId: string,
      hookPayload: unknown,
    ): Promise<{ taskId: string; status: { taskId: string } }>;
  }
}
