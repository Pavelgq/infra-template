const { BASE_URL, METHODS } = require("./constants");
require("dotenv").config();

const fetch = require("node-fetch");

const fetchDefaultHeaders = {
  Authorization: `OAuth ${process.env.OAUTH_TOKEN}`,
  "X-Org-ID": `${process.env.X_ORG_ID}`,
};

class Tracker {
  async findTicket() {
    const data = await fetch(`${BASE_URL}/v2/issues/_search`, {
      method: METHODS.POST,
      headers: fetchDefaultHeaders,
      data: {
        filter: {
          key: process.env.TICKET_ID,
        },
      },
    });
    if (!data.length) {
      this.loger("ticket not found");
      return null;
    }
    return data[0];
  }
  async createTicket(tag, author, changes) {
    this.loger("create new ticket");
    await fetch(`${BASE_URL}/v2/issues/`, {
      method: "POST",
      headers: fetchDefaultHeaders,
      data: await this.setTicketData(tag, author, changes),
    });
  }
  async updateTicket(key, tag, author, changes) {
    this.loger(`update ticket with key: ${key}`);
    await fetch(`${BASE_URL}/v2/issues/{key}`, {
      method: "PATCH",
      headers: fetchDefaultHeaders,
      data: await this.setTicketData(tag, author, changes),
    });
  }

  async setTicketData(tag, author, changes) {
    const date = new Date(Date.now()).toLocaleDateString("ru-RU");
    const description = `Автор: ${author}\nДата релиза: ${date}\nВерсия: ${tag}\nИзменения:\n${changes}`;
    this.loger(`create ticket data for ${`Релиз №${tag.split("-")[1]}`}`);
    this.loger(`${description}`);
    return {
      summary: `Релиз №${tag.split("-")[1]}`,
      description,
      queue: "INFRA",
      unique: `${process.env.ORG_ID}_${tag}`,
    };
  }

  loger(message, error) {
    error
      ? console.error(`Tracker Error: ${message}`)
      : console.log(`Tracker: ${message}`);
  }
}

module.exports = Tracker;
