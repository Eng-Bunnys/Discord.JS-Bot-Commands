import {
  BaseMessageOptions,
  DMChannel,
  GuildMember,
  Interaction,
  Message,
  PermissionFlagsBits,
  PermissionResolvable,
  TextBasedChannel,
} from "discord.js";

/**
 * Takes a string and lowercases it then uppercase the first word of each sentence you could say
 * @param {string}  str - The word to be like Custom Status instead of just CUSTOM STATUS
 * @returns {string} - Returns a beautified converted string
 * @example capitalize(string)
 */
export function capitalize(str: string): string {
  return str.replace(/(?<=\W)(\w)/g, (char) => char.toUpperCase());
}

export function GetRandomFromArray<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export function IsValidURL(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**

Converts a number of milliseconds into a string representation of time with
units of varying granularity.
 * @param {number} time - The time in milliseconds.
 * @param {object} [options] - Optional configuration options.
 * @param {string} [options.format='long'] - The format of the output string ('short' or 'long').
 * @param {boolean} [options.spaces=false] - Whether to include spaces in the output string.
 * @param {string} [options.joinString=' '] - The string to use for joining time units.
 * @param {number} [options.unitRounding=100] - The maximum number of time units to include in the output string.
 * @returns {string|undefined} The human-readable duration string, or undefined if the time is not a number or is negative.
@example
// Returns "1 hour 30 minutes"
msToTime(5400000);
@example
// Returns "2d 3h 45m"
msToTime(189000000, { format: 'short', spaces: true, joinString: ' ', unitRounding: 3 });
*/

interface Options {
  format?: "long" | "short";
  spaces?: boolean;
  joinString?: string;
  unitRounding?: number;
}

export function msToTime(
  time: number,
  options: Options = {}
): string | undefined {
  const defaultOptions: Options = {
    format: "long",
    spaces: false,
    joinString: " ",
    unitRounding: 100,
  };

  options = Object.assign({}, defaultOptions, options);

  let timeStr = "";
  let nr = 0;

  if (typeof time !== "number" || time < 0) {
    return undefined;
  }

  const timeUnits = Object.keys(timeUnitValues);
  for (let i = 0; i < timeUnits.length; i++) {
    const key = timeUnits[i];
    if (!fullTimeUnitNames[key]) continue;

    let ctime = time / timeUnitValues[key];
    if (ctime >= 1) {
      if ((options.unitRounding || 100) < ++nr) break;

      ctime = Math.floor(ctime);
      timeStr += `${ctime} ${fullTimeUnitNames[key][options.format]}${
        ctime !== 1 && options.format !== "short" ? "s" : ""
      }${options.spaces ? " " : options.joinString}`;
      time -= ctime * timeUnitValues[key];
    }
  }

  timeStr = timeStr.trim();
  if (timeStr === "") return undefined;
  return timeStr;
}

export function MissingPermissions(
  TargetMember: GuildMember,
  RequiredPermissions: PermissionResolvable | PermissionResolvable[]
) {
  const missingPerms = TargetMember.permissions
    .missing(RequiredPermissions)
    .map(
      (str) =>
        `\`${str
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b(\w)/g, (char) => char.toUpperCase())}\``
    );

  return missingPerms;
}

export async function SendAndDelete(
  Channel: TextBasedChannel,
  MessageOptions: BaseMessageOptions,
  TimeInSeconds = 5
): Promise<Message<false>> {
  if (Channel instanceof DMChannel) return Channel.send(MessageOptions);
  //@ts-ignore
  const message: Message | Interaction = await Channel.send(MessageOptions);

  setTimeout(async () => {
    //@ts-ignore
    await message.delete();
  }, TimeInSeconds * 1000);
}

export function chooseRandomFromArray<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export function trimArray<T>(arr: T[], maxLen = 10, type = `role(s)`): T[] {
  if (arr.length > maxLen) {
    const len = arr.length - maxLen;
    arr = arr.slice(0, maxLen);
    arr.push(` and ${len} more ${type}...` as unknown as T);
  }
  return arr;
}

export function KeyPerms(role: GuildMember) {
  let KeyPermissions = [];
  if (role.permissions.has(PermissionFlagsBits.Administrator))
    return ["Administrator", 1];
  else {
    if (role.permissions.has(PermissionFlagsBits.ManageGuild))
      KeyPermissions.push(`Manage Server`);
    if (role.permissions.has(PermissionFlagsBits.ManageRoles))
      KeyPermissions.push(`Manage Roles`);
    if (role.permissions.has(PermissionFlagsBits.ManageChannels))
      KeyPermissions.push(`Manage Channels`);
    if (role.permissions.has(PermissionFlagsBits.KickMembers))
      KeyPermissions.push(`Kick Members`);
    if (role.permissions.has(PermissionFlagsBits.BanMembers))
      KeyPermissions.push(`Ban Members`);
    if (role.permissions.has(PermissionFlagsBits.ManageNicknames))
      KeyPermissions.push(`Manage Nicknames`);
    if (role.permissions.has(PermissionFlagsBits.ManageGuildExpressions))
      KeyPermissions.push(`Manage Emojis & Stickers`);
    if (role.permissions.has(PermissionFlagsBits.ManageMessages))
      KeyPermissions.push(`Manage Messages`);
    if (role.permissions.has(PermissionFlagsBits.MentionEveryone))
      KeyPermissions.push(`Mention Everyone`);
    if (role.permissions.has(PermissionFlagsBits.ModerateMembers))
      KeyPermissions.push(`Moderate Members`);
  }
  return [KeyPermissions.join(", ") || "No Permissions", KeyPermissions.length];
}

const timeUnitValues: Record<string, number> = {
  year: 31557600000,
  day: 86400000,
  hour: 3600000,
  minute: 60000,
  second: 1000,
  ms: 1,
};

const fullTimeUnitNames: Record<string, Record<string, string>> = {
  year: { long: "year", short: "yr" },
  day: { long: "day", short: "day" },
  hour: { long: "hour", short: "hr" },
  minute: { long: "minute", short: "min" },
  second: { long: "second", short: "sec" },
};