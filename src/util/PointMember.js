const Discord = require("discord.js");

class PointMember {
  __id;
  __nganh;
  __points;

  // Initalize with file TODO
  constructor(id, nganh, points) {
    this.__id = id;
    this.__nganh = nganh;
    this.__points = points;
  }

  static emptyConstructor(id) {
    return new PointMember(id, "N/A", 0);
  }

  get id() {
    return this.__id;
  }

  set id(x) {
    this.__id = x;
  }

  get nganh() {
    return this.__nganh;
  }

  set nganh(x) {
    this.__nganh = x;
  }

  get points() {
    return this.__points;
  }

  set points(x) {
    this.__points = x;
  }

  toJSON() {
    return {
      id: this.__id,
      name: this.__name,
      nganh: this.__nganh,
      points: this.__points,
    };
  }
}

module.exports = PointMember;
