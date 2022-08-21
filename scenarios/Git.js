const util = require("util");
const exec = util.promisify(require("child_process").exec);

class Git {
  /**
   * Проверки git
   * @returns
   */
  async isGit() {
    const error = (await exec("git --version")).stderr;
    if (error) {
      this.loger("Git not available", true);
      this.loger(error, true);
      return false;
    }
    this.loger("git is OK");
    return true;
  }

  /**
   * Возвращает два последних резизных тега
   * @returns
   */
  async getPrevTags() {
    const gitTags = (await exec("git tag")).stdout;
    const tags = gitTags.split(/\r?\n/).reverse().filter(Boolean);
    if (!tags[0]) {
      this.loger("No required tags", true);
      return null;
    }
    this.loger(`get current and previous tags`);
    return [tags[0], tags[1]];
  }

  /**
   * Возвращает hash коммита по тэгу
   * @param {string} tag
   * @returns
   */
  async getTagHash(tag) {
    const result = await exec(`git rev-parse '${tag}'`);
    this.loger(`get hash from tag: ${tag} - ${result}`);
    return result.stdout.trim("\n");
  }

  /**
   * Возвращает список коммитов между тегами в переданном формате
   * @param {RegExp} format
   * @param {number} count
   * @param {string} currentTag
   * @param {[tagHash, tagHash]} tagsHash
   * @returns
   */
  static async getCommits(format, count = 0, currentTag, tagsHash) {
    const command = `git log --pretty=format:'${format}' ${
      count > 0 ? `--max-count=${count}` : ""
    } ${!currentTag ? "--reverse" : ""} ${tagsHash[0]}${
      currentTag ? "..." + tagsHash[1] : ""
    }`;
    const result = await exec(command);
    this.loger(`log ${result}`);
    return result.stdout;
  }

  loger(message, error) {
    error
      ? console.error(`Git Error: ${message}`)
      : console.log(`Git: ${message}`);
  }
}

module.exports = Git;
//TODO: Если тег один, то берем все коммиты до него
