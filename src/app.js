import games from './data/games-data.js';
import groups from './data/groups-data.js';

window.addEventListener('DOMContentLoaded', (event) => {
  const worldsCalculator = new worldsGroupsCalculator();
});

class worldsGroupsCalculator {
  constructor() {
    this.games = games;
    this.groups = groups;
    this.throttleTime = null;

    const gamesNode = document.getElementById("games");

    for (const [index, gameDay] of this.games.entries()) {
      const day = document.createElement("div");
      day.classList.add("col-12", "col-lg-6", "game-day");

      const headline = document.createElement("h2");
      headline.classList.add("d-flex", "justify-content-center");
      headline.textContent = `Day ${index + 1}`;
      day.appendChild(headline);

      for (const game of gameDay) {
        let team1Status = "";
        let team2Status = "";

        if (game.winner) {
          if (game.team1 === game.winner) {
            team1Status = "active";
          } else {
            team2Status = "active";
          }
        }

        const html = `<div class="col text-right d-flex align-items-center justify-content-end">${this.getFullTeamName(game.team1)}</div>
                    <div class="col-auto d-flex align-items-center">
                        <div class="btn-group btn-group-toggle" rel="js-game" data-game-id="${game.id}" data-toggle="buttons">
                            <label class="btn btn-outline-primary btn-left ${team1Status}">
                                <input type="button" id="game-${game.id}-${game.team1}" autocomplete="off" data-win="${game.team1}">
                            </label>
                            <label class="btn btn-outline-primary btn-right ${team2Status}">
                                <input type="button" id="game-${game.id}-${game.team2}" autocomplete="off" data-win="${game.team2}">
                            </label>
                        </div>
                    </div>
                    <div class="col d-flex align-items-center">${this.getFullTeamName(game.team2)}</div>`;
        const row = document.createElement("div");
        row.innerHTML = html;
        row.classList.add("row");
        day.appendChild(row);
      }

      gamesNode.appendChild(day);
    }

    const toggles = document.querySelectorAll(".btn.btn-outline-primary");

    const buttonInteraction = (event) => {
      if(this.throttle()) {
        return;
      }

      const target = event.target;

      const parentChildren = target.parentNode.children;

      const sibling = parentChildren[0] !== target ? parentChildren[0] : parentChildren[1];

      if (!sibling) {
        return;
      }

      if (target.classList.contains("active")) {
        target.classList.remove("active");
      } else if (sibling.classList.contains("active")) {
        sibling.classList.remove("active");
        target.classList.add("active");
      } else {
        target.classList.add("active");
      }

      this.update();
    };

    toggles.forEach((elem) => {
      elem.addEventListener('touchend', buttonInteraction);
      elem.addEventListener('click', buttonInteraction);
    });

    this.update();
  }

  update() {
    this.resetScores();
    this.getResults();
    this.calculateScore();
    this.sortTeams();
    this.draw();
  }


  resetScores() {
    for (const group of this.groups) {
      group.forEach((element) => {
        element.wins = 0;
        element.losses = 0;
      });
    }
  }


  getResults() {
    const games = document.querySelectorAll("[rel='js-game']");

    for (const game of games) {
      const teams = game.getElementsByClassName("btn");
      const gameId = game.getAttribute("data-game-id");

      let winningTeam = null;
      let losingTeam = null;

      if (teams[0].classList.contains("active")) {
        winningTeam = teams[0];
        losingTeam = teams[1];
      } else if (teams[1].classList.contains("active")) {
        winningTeam = teams[1];
        losingTeam = teams[0];
      } else {
        this.mutateResult(null, null, gameId);
      }

      if (!winningTeam) {
        continue;
      }

      const shortNameWinningTeam = winningTeam.getElementsByTagName("input")[0].getAttribute("data-win");
      const shortNameLosingTeam = losingTeam.getElementsByTagName("input")[0].getAttribute("data-win");

      this.mutateResult(shortNameWinningTeam, shortNameLosingTeam, gameId);
    }
  }


  mutateResult(winningTeam, losingTeam, gameId) {
    const game = this.games.flat(2).find((game) => {
      return game.id === parseInt(gameId);
    });

    game.winner = winningTeam;
    game.loser = losingTeam;
  }


  calculateScore() {
    for (const game of this.games.flat(2)) {
      if (!game.winner) {
        continue;
      }

      const winner = this.getTeam(game.winner);
      const loser = this.getTeam(game.loser);

      winner.wins++;
      loser.losses++;
    }

    for (const group of this.groups) {
      group.forEach((element) => {
        element.score = element.wins - element.losses;
      });
    }
  }


  sortTeams() {
    function compare(a, b) {
      if (a.score < b.score) {
        return 1;
      } else if (a.score > b.score) {
        return -1;
      }

      const gameCountA = a.wins + a.losses;
      const gameCountB = b.wins + b.losses;

      if (gameCountA < gameCountB) {
        return 1;
      } else if (gameCountA > gameCountB) {
        return -1;
      }

      if (a.shortName.charAt(0) > b.shortName.charAt(0)) {
        return 1;
      } else if (a.shortName.charAt(0) < b.shortName.charAt(0)) {
        return -1;
      }

      if (a.shortName.charAt(1) > b.shortName.charAt(1)) {
        return 1;
      } else if (a.shortName.charAt(1) < b.shortName.charAt(1)) {
        return -1;
      }

      return 1;
    }

    for (const group of this.groups) {
      group.sort(compare);
    }
  }


  draw() {
    const groupsNode = document.getElementById("groups");

    while (groupsNode.firstChild) {
      groupsNode.removeChild(groupsNode.firstChild);
    }

    for (const [index, group] of this.groups.entries()) {
      const groupNode = document.createElement("div");
      groupNode.classList.add("col-12", "col-lg-6", "group");
      groupNode.setAttribute("id", `group${index + 1}`);
      groupNode.setAttribute("rel", `rel="js-game"`);

      group.forEach((element, i) => {
        const row = document.createElement("div");
        row.classList.add("row", "d-flex", "justify-content-center");

        const numberCol = document.createElement("div");
        const numberText = document.createTextNode(`${i + 1}`);
        numberCol.classList.add("col-auto", "text-left");
        numberCol.appendChild(numberText);

        const nameCol = document.createElement("div");
        const nameText = document.createTextNode(element.name);
        nameCol.classList.add("col-5");
        nameCol.appendChild(nameText);

        const resultCol = document.createElement("div");
        const resultText = document.createTextNode(`${element.wins} - ${element.losses}`);
        resultCol.classList.add("col-auto", "text-right");
        resultCol.appendChild(resultText);

        row.appendChild(numberCol);
        row.appendChild(nameCol);
        row.appendChild(resultCol);

        groupNode.appendChild(row);
        groupsNode.appendChild(groupNode);
      });
    }
  }


  getTeam(shortName) {
    let team = null;

    for (const group of this.groups) {
      team = group.find((element) => {
        return element.shortName === shortName;
      });

      if (team) {
        return team;
      }
    }

    return team;
  }


  getFullTeamName(shortName) {
    const team = this.groups.flat(2).find((element) => {
      return element.shortName === shortName;
    });

    return team.name;
  }

  throttle() {
    if (!this.throttleTime) {
      this.throttleTime = Date.now();

      return false;
    } else {
      if (this.throttleTime + 300 < Date.now()) {
        this.throttleTime = Date.now();

        return false;
      } else {
        return true;
      }
    }
  }
}
