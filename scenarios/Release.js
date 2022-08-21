const core = require("@actions/core");
const Git = require("./Git");
const Tracker = require("./Tracker");

const util = require("util");
const exec = util.promisify(require("child_process").exec);

class Release {
  async buildDocker() {
    const tracker = new Tracker();

    let currentTicket = await tracker.findTicket();

    if (currentTicket) {
      const comments = await tracker.getComments(currentTicket.key);
      if (comments.length) {
        comments.forEach(async (comment) => {
          await tracker.deleteComment(currentTicket.id, comment.id);
        });
      }
      console.log(core.getInput("mytag"), core.getInput("tags"));
      await tracker.createComment(
        currentTicket.key,
        `Собрали образ в тегом ${core.getInput("tags")}`
      );
    }
  }

  async run() {
    const git = new Git();

    if (!git.isGit()) return;

    const tracker = new Tracker();

    const [currentTag, prevTag] = await git.getPrevTags();

    let currentHashTag = currentTag ? await git.getTagHash(currentTag) : null;
    let prevHashTag = prevTag ? await git.getTagHash(prevTag) : null;

    let currentTicket = await tracker.findTicket();

    const author = await git.getCommits("%aN <%aE>", 1, currentTag, [
      currentHashTag,
      prevHashTag,
    ]);
    const changes = await git.getCommits("%H %cn %s", 0, currentTag, [
      currentHashTag,
      prevHashTag,
    ]);
    if (currentTicket) {
      await tracker.updateTicket(
        currentTicket.key,
        currentTag,
        author,
        changes
      );
    } else {
      currentTicket = await tracker.createTicket(currentTag, author, changes);
    }
  }
}

module.exports = Release;
