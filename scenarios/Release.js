const Git = require("./Git");
const Tracker = require("./Tracker");

const util = require("util");
const exec = util.promisify(require("child_process").exec);

class Release {
  buildDocker() {
    exec("docker build .").then(({ stdout, stderr }) => {
      if (stderr) {
        console.error(stderr);
      }
      console.log(stdout);
    });
  }
  checkTests() {
    exec("npx jest").then(({ stdout, stderr }) => {
      if (stderr) {
        console.error(stderr);
      }
      console.log(stdout);
    });
  }

  async run() {
    const git = new Git();

    if (!git.isGit()) return;

    const tracker = new Tracker();

    const [currentTag, prevTag] = await git.getPrevTags();

    let currentHashTag = currentTag ? await git.getTagHash(currentTag) : null;
    let prevHashTag = prevTag ? await git.getTagHash(prevTag) : null;

    let currentTicket = await tracker.findTicket(currentTag);

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

new Release().run();
