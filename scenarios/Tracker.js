const { BASE_URL, METHODS } = require("./constants");
require("dotenv").config();

const fetch = require("node-fetch");

const fetchDefaultHeaders = {
  Authorization: `OAuth ${process.env.OAUTH_TOKEN}`,
  "X-Org-ID": `${process.env.X_ORG_ID}`,
  "Content-Type": "application/json",
};

class Tracker {
  async findTicket() {
    try {
      const response = await fetch(`${BASE_URL}/v2/issues/_search`, {
        method: METHODS.POST,
        headers: fetchDefaultHeaders,
        body: JSON.stringify({
          filter: {
            key: process.env.TICKET_ID,
          },
        }),
      });
      const data = await response.json();
      if (!data.length) {
        this.loger("ticket not found");
        return null;
      }
      this.loger(JSON.stringify(data[0].summary));
      return data[0];
    } catch (error) {
      this.loger(error, true);
    }
  }
  async createTicket(tag, author, changes) {
    try {
      this.loger("create new ticket");
      await fetch(`${BASE_URL}/v2/issues/`, {
        method: METHODS.POST,
        headers: fetchDefaultHeaders,
        body: this.setTicketData(tag, author, changes),
      });
    } catch (error) {
      this.loger(error, true);
    }
  }
  async updateTicket(key, tag, author, changes) {
    try {
      console.log(fetchDefaultHeaders);
      const data = this.setTicketData(tag, author, changes);
      this.loger(`update ticket with key: ${key}`);
      this.loger(JSON.stringify(data));
      await fetch(`${BASE_URL}/v2/issues/${key}`, {
        method: METHODS.PATCH,
        headers: fetchDefaultHeaders,
        body: JSON.stringify(data),
      });
    } catch (error) {
      this.loger(error, true);
    }
  }

  setTicketData(tag, author, changes) {
    const date = new Date(Date.now()).toLocaleDateString("ru-RU");
    const description = `Ответственный за релиз: ${author}\nКоммиты, попавшие в релиз:\n${changes}`;
    this.loger(`create ticket data for ${`Релиз №${tag.split("-")[1]}`}`);
    this.loger(`${description}`);
    return {
      summary: `Релиз №${tag.split("-")[1]} ${date}`,
      description,
      queue: "INFRA",
    };
  }

  async createComment(key, comment) {
    try {
      this.loger(`create new comment for ${key}`);
      await fetch(`${BASE_URL}/v2/issues/${key}/comments`, {
        method: METHODS.POST,
        headers: fetchDefaultHeaders,
        body: JSON.stringify({
          text: comment,
        }),
      });
    } catch (error) {
      this.loger(error, true);
    }
  }

  async getComments(key) {
    try {
      this.loger("get tickets");
      const response = await fetch(`${BASE_URL}/v2/issues/${key}/comments`, {
        method: METHODS.GET,
        headers: fetchDefaultHeaders,
      });
      const data = await response.json();
      return data;
    } catch (error) {
      this.loger(error, true);
    }
  }

  async deleteComment(id, commentId) {
    try {
      this.loger(`delete ticket ${id} comment: ${commentId}`);
      await fetch(`${BASE_URL}/v2/issues/${id}/comments/${commentId}`, {
        method: METHODS.DELETE,
        headers: fetchDefaultHeaders,
      });
    } catch (error) {
      this.loger(error, true);
    }
  }

  loger(message, error) {
    error
      ? console.error(`Tracker Error: ${message}`)
      : console.log(`Tracker: ${message}`);
  }
}

module.exports = Tracker;
