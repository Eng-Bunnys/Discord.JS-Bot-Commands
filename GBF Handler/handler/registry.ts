import { lstatSync, readdirSync } from "fs";
import { join } from "path";
import Command from "../utils/command";
import GBFClient from "./clienthandler";
import { ContextCommand } from "../utils/context";
import SlashCommand from "../utils/slashCommands";

export async function registerCommands(client: GBFClient, ...dirs: string[]) {
  for (const dir of dirs) {
    let files = await readdirSync(join(__dirname, dir));

    for (let file of files) {
      let stat = await lstatSync(join(__dirname, dir, file));

      if (file.includes("-ignore")) continue;

      if (stat.isDirectory()) await registerCommands(client, join(dir, file));
      else {
        if (file.endsWith(".js") || file.endsWith(".ts")) {
          try {
            let cmdModule = new (require(join(__dirname, dir, file)).default)(
              client
            );

            if (cmdModule instanceof Command) {
              const { name, aliases } = cmdModule;

              if (!name) {
                console.log(
                  `The '${join(
                    __dirname,
                    dir,
                    file
                  )}' command doesn't have a name. Please double check the code!`
                );
                continue;
              }

              if (client.commands.has(name)) {
                console.log(
                  `The '${name}' (${join(
                    __dirname,
                    dir,
                    file
                  )}) command name has already been added. Please double check the code!`
                );
                continue;
              }

              if (!client.DisabledCommands.includes(name)) {
                client.commands.set(name, cmdModule);
              }

              if (aliases)
                aliases.map((alias) => client.aliases!.set(alias, name));
            } else if (cmdModule instanceof SlashCommand) {
              const { name } = cmdModule;

              if (!name) {
                console.log(
                  `The '${join(
                    __dirname,
                    dir,
                    file
                  )}' command doesn't have a name. Please double check the code!`
                );
                continue;
              }

              if (client.slashCommands.has(name)) {
                console.log(
                  `The '${name}' (${join(
                    __dirname,
                    dir,
                    file
                  )}) slash command name has already been added. Please double check the code!`
                );
                continue;
              }
              client.slashCommands.set(name, cmdModule);
            } else if (cmdModule instanceof ContextCommand) {
              const { name } = cmdModule;

              if (!name) {
                console.log(
                  `The '${join(
                    __dirname,
                    dir,
                    file
                  )}' command doesn't have a name. Please double check the code!`
                );
                continue;
              }

              if (client.contextCmds.has(name)) {
                console.log(
                  `The '${name}' (${join(
                    __dirname,
                    dir,
                    file
                  )}) context command name has already been added. Please double check the code!`
                );
                continue;
              }

              client.contextCmds.set(name, cmdModule);
            }
          } catch (e) {
            console.log(`Error for loading the commands: ${e.message}`);
          }
        }
      }
    }
  }
}
