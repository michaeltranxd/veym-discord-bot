# In-depth Documentation on Commands

## Overview

- [`members-update`](#members-update)
- [`points give`](#points-give)
- [`points giveall`](#points-giveall)
- [`points remove`](#points-remove)
- [`points removeall`](#points-removeall)
- [`points update`](#points-update)
- [`points updateall`](#points-updateall)

# Commands

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

### ------ Points ------

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
    - Chris, Jack, Mindy, and Pete all receive 10 points

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

- `points updateall <amount> <@discordname>, <@discordname>, ...`
  - Description: Updates all users supplied to have `<amount>` points
- Usage: `!points give <amount> <@discordname>, <amount> <@discordname>, ...`
- Arguments
  - `<amount>` - A number for the amount of points user to receive
  - `<@discordname>` - Mention the user by typing @name
  - Every user added is seperated by a comma
- Example:
  - Single user: `!points giveall 10 @Chris`
    - Chris has 10 points
  - Multiple users: `!points giveall 10 @Chris, @Jack, @Mindy, @Pete`
    - Chris, Jack, Mindy, and Pete all have 10 points
