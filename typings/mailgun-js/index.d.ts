declare module "mailgun-js" {
  var out: Mailgun.MailgunExport;
  export = out;
}

declare namespace Mailgun {
  type ConstructorParams = {
    apiKey: string;
    publicApiKey?: string;
    domain: string;
    mute?: boolean;
    timeout?: number;
    host?: string;
    endpoint?: string;
    protocol?: string;
    port?: number;
    retry?: number;
    proxy?: string;
  };

  type Error = {
    statusCode: number;
    message: string;
  };

  type AttachmentParams = {
    data: string | Buffer | NodeJS.ReadWriteStream;
    filename?: string;
    knownLength?: number;
    contentType?: string;
  };

  class Attachment {
    constructor(params: AttachmentParams);
    data: string | Buffer | NodeJS.ReadWriteStream;
    filename?: string;
    knownLength?: number;
    contentType?: string;
    getType(): string;
  }

  interface MailgunExport {
    new (options: ConstructorParams): Mailgun;
    (options: ConstructorParams): Mailgun;
  }

  namespace messages {
    type SendData = {
      from: string;
      to: string | string[];
      cc?: string;
      bcc?: string;
      subject: string;
      text?: string;
      html?: string;
      attachment?: string | Buffer | NodeJS.ReadWriteStream | Attachment;
    };

    /**
     * Batch sending to many recipients, with substitution for member emails/names/other vars
     * For batch sending, see this data example:
     * var data: SendData = {
     *   from: 'Excited User <me@acme.com>',
     *   to: ['bob@companyx.com', 'alice@companyy.com'],
     *   subject: 'Hey, %recipient.first%',
     *   'recipient-variables': {
     *     'bob@companyx.com': {
     *       first: 'Bob',
     *       id: 1
     *     },
     *     'alice@companyy.com': {
     *       first: 'Alice',
     *       id: 2
     *     },
     *   text: 'If you wish to unsubscribe, click http://mailgun/unsubscribe/%recipient.id%',
     * };
     */
    type BatchData = SendData & {
      "recipient-variables"?: BatchSendRecipientVars;
    };

    type BatchSendRecipientVars = {
      [email: string]: {
        first: string;
        id: number;
      };
    };

    type SendResponse = {
      message: string;
      id: string;
    };
  }

  namespace lists {
    type MemberCreateData = {
      subscribed: boolean;
      address: string;
      name: string;
      vars?: object;
    };

    type MemberUpdateData = {
      subscribed: boolean;
      name: string;
      vars?: object;
    };

    interface Members {
      create(
        data: MemberCreateData,
        callback?: (err: Error, data: any) => void
      ): Promise<any>;
      add(
        data: MemberCreateData[],
        callback?: (err: Error, data: any) => void
      ): Promise<any>;
      list(callback?: (err: Error, data: any) => void): Promise<any>;
    }

    interface Member {
      update(
        data: MemberUpdateData,
        callback?: (err: Error, data: any) => void
      ): Promise<any>;
    }
  }

  namespace validation {
    type ParseResponse = {
      parsed: string[];
      unparseable: string[];
    };

    type ValidateResponse = {
      is_valid: boolean;
    };
  }

  interface Mailgun {
    messages(): Mailgun.Messages;
    lists(list: string): Mailgun.Lists;

    Attachment: typeof Attachment;

    validateWebhook(
      bodyTimestamp: number,
      bodyToken: string,
      bodySignature: string
    ): boolean;

    parse(
      addressList: string[],
      callback?: (error: Error, body: validation.ValidateResponse) => void
    ): Promise<validation.ParseResponse>;

    validate(
      address: string,
      callback?: (error: Error, body: validation.ValidateResponse) => void
    ): Promise<validation.ValidateResponse>;
  }

  interface Lists {
    info(callback?: (error: Error, data: any) => void): Promise<any>;
    members(): lists.Members;
    members(member: string): lists.Member;
  }

  interface Messages {
    send(
      data: messages.SendData,
      callback?: (error: Error, body: messages.SendResponse) => void
    ): Promise<messages.SendResponse>;

    send(
      data: messages.BatchData,
      callback?: (error: Error, body: messages.SendResponse) => void
    ): Promise<messages.SendResponse>;
  }
}
