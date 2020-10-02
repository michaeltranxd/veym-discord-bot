# In-depth Documentation on Commands

## Overview

- [`setup`](#setup)
- [`members-update`](#members-update)
- [`points give`](#points-give)
- [`points giveall`](#points-giveall)
- [`points remove`](#points-remove)
- [`points removeall`](#points-removeall)
- [`points update`](#points-update)
- [`points updateall`](#points-updateall)
- [`points-list <nganh> name`](#points-list-<nganh>-name)
- [`points-list <nganh> points`](#points-list-<nganh>-points)
- [`points-list overall name`](#points-list-overall-name)
- [`points-list overall nganh name`](#points-list-overall-nganh-name)
- [`points-list overall nganh points`](#points-list-overall-nganh-points)
- [`points-list overall points`](#points-list-overall-points)

# Commands

## `setup`

- Description: View and set roles that have permission to use admin commands. Must be used to initialize the server with at least one role for admin permissions
- Usage: `!setup`
- Usage with arguments: `!setup @role1 @role2 ...`
- Arguments
  - `<@role>` - Mention the role typing @rolename
  - Every role added is seperated by a space
- Example:
  - See prompt and instructions for setup: `!setup`
  - Assign admin roles: `!setup @HT_Squad @HLV_Squad ...`

## `members-update`

- Description: Updates nganh for a particular user or multiple users, each user has its own `<nganh>`
- Usage: `!members-update <@discordname> <nganh>, <@discordname> <nganh>, ...`
- Arguments
  - `<@discordname>` - Mention the user by typing @name
  - `<nganh>` - Valid nganhs are AN/TN/NS/HS/HT
  - Every user added is seperated by a comma
- Example:
  - Single user: `!members-update @Chris AN`
  - Multiple users: `!members-update @Chris AN, @Jack TN, @Mindy HS, @Pete HT`

## `points give`

- Description: Give `<amount>` points to the user supplied, each user has its own `<amount>`
- Usage: `!points give <amount> <@discordname>, <amount> <@discordname>, ...`
- Arguments
  - `<amount>` - A number for the amount of points user to receive
  - `<@discordname>` - Mention the user by typing @name
  - Every user added is seperated by a comma
- Example:
  - Single user: `!points give 10 @Chris`
    - Chris receives +10 points
  - Multiple users: `!points give 10 @Chris, 20 @Jack, 30 @Mindy, 40 @Pete`
    - Chris receives +10 points, Jack receives +20 points, Mindy receives +30 points, and Pete receives +40 points

## `points giveall`

- Description: Give `<amount>` points to all the users supplied
- Usage: `!points giveall <amount> <@discordname>, <@discordname>, ...`
- Arguments
  - `<amount>` - A number for the amount of points user to receive
  - `<@discordname>` - Mention the user by typing @name
  - Every user added is seperated by a comma
- Example:
  - Single user: `!points giveall 10 @Chris`
    - Chris receives +10 points
  - Multiple users: `!points giveall 10 @Chris, @Jack, @Mindy, @Pete`
    - Chris, Jack, Mindy, and Pete all receive +10 points

## `points remove`

- Description: Removes `<amount>` points from the user supplied, each user has its own `<amount>`
- Usage: `!points remove <amount> @discordname, <amount> <@discordname>, ...`
- Arguments
  - `<amount>` - A number for the amount of points user to receive
  - `<@discordname>` - Mention the user by typing @name
  - Every user added is seperated by a comma
- Example:
  - Single user: `!points remove 10 @Chris`
    - Chris lose 10 points
  - Multiple users: `!points remove 10 @Chris, 20 @Jack, 30 @Mindy, 40 @Pete`
    - Chris lose 10 points, Jack lose 20 points, Mindy lose 30 points, and Pete lose 40 points

## `points removeall`

- Description: Removes `<amount>` points from all the users supplied
- Usage: `!points removeall <amount> <@discordname>, <@discordname>, ...`
- Arguments
  - `<amount>` - A number for the amount of points user to receive
  - `<@discordname>` - Mention the user by typing @name
  - Every user added is seperated by a comma
- Example:
  - Single user: `!points removeall 10 @Chris`
    - Chris lose 10 points
  - Multiple users: `!points removeall 10 @Chris, @Jack, @Mindy, @Pete`
    - Chris, Jack, Mindy, and Pete all lose 10 points

## `points update`

- Description: Updates the user supplied to `<amount>` points, each user has its own `<amount>`
- Usage: `!points update <amount> @discordname, <amount> <@discordname>, ...`
- Arguments
  - `<amount>` - A number for the amount of points user to receive
  - `<@discordname>` - Mention the user by typing @name
  - Every user added is seperated by a comma
- Example:
  - Single user: `!points update 10 @Chris`
    - Chris has 10 points
  - Multiple users: `!points update 10 @Chris, 20 @Jack, 30 @Mindy, 40 @Pete`
    - Chris has 10 points, Jack has 20 points, Mindy has 30 points, and Pete has 40 points

## `points updateall`

- Description: Updates all users supplied to have `<amount>` points
- Usage: `!points updateall <amount> <@discordname>, <@discordname>, ...`
- Arguments
  - `<amount>` - A number for the amount of points user to receive
  - `<@discordname>` - Mention the user by typing @name
  - Every user added is seperated by a comma
- Example:
  - Single user: `!points updateall 10 @Chris`
    - Chris has 10 points
  - Multiple users: `!points updateall 10 @Chris, @Jack, @Mindy, @Pete`
    - Chris, Jack, Mindy, and Pete all have 10 points

## `points-list <nganh> name`

- Description: Lists the points of the users in the server that are listed as `<nganh>` and sorts by name
- Usage: `!points-list <nganh> name`
- Arguments
  - `<nganh>` - The nganh of the user, valid inputs (AN/TN/NS/HS/HT)
- Example:
  - `!points-list AN name`
    - This lists all users who are listed as AN and organizes them by name (alphabetical order)

## `points-list <nganh> points`

- Description: Lists the points of the users in the server that are listed as `<nganh>` and sorts by points descending
- Usage: `!points-list <nganh> points`
- Arguments
  - `<nganh>` - The nganh of the user, valid inputs (AN/TN/NS/HS/HT)
- Example:
  - `!points-list AN points`
    - This lists all users who are listed as AN and organizes them by points (descending order)

## `points-list overall name`

- Description: Lists the points of all users in the server sorted by name
- Usage: `!points-list overall name`
- Arguments
  - N/A
- Example:
  - `!points-list overall name`
    - This lists all users in the server in alphabetical order

## `points-list overall nganh name`

- Description: Lists the points of all users in the server sorted by nganh then by name
- Usage: `!points-list overall nganh name`
- Arguments
  - N/A
- Example:
  - `!points-list overall nganh name`
    - This lists all users in the server by respective nganh (AN first, HT last) and then sorts by name (alphabetical order)

## `points-list overall nganh points`

- Description: Lists the points of all users in the server sorted by nganh then by points descending
- Usage: `!points-list overall nganh points`
- Arguments
  - N/A
- Example:
  - `!points-list overall nganh points`
    - This lists all users in the server by respective nganh (AN first, HT last) and then sorts by points (descending order)

## `points-list overall points`

- Description: Lists the points of all users in the server sorted by points (descending order)
- Usage: `!points-list overall points`
- Arguments
  - N/A
- Example:
  - `!points-list overall points`
    - This lists all users in the server by points (descending order)
