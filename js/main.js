'use strict';

var loadJSON,
    ships,
    activeShip = [],
    rowShip = null,
    columnShip = null,
    currentShip = {},
    globalShipsArr = [],
    computerShips = [],
    shipCount = 0,
    shipsToPut,
    isGameOn = false,
    isGameEnded = false,
    opponentScore = 0,
    userScore = 0,
    computerTurn = false,
    gameType = 'PvC';

var computerAI = window.computerAI,
    helper = window.helper;

(loadJSON = function() {
  var getJSON = new XMLHttpRequest();
  getJSON.overrideMimeType('application/json');
  getJSON.open('GET', 'ships.json', true);
  getJSON.onreadystatechange = function () {
    if (getJSON.readyState == 4 && getJSON.status == '200') {
      ships = JSON.parse(getJSON.responseText).ships;
      currentShip = ships[0];
    }
  };
  getJSON.send(null);
}).call();

var changeGameType = function(val) {
  gameType = val;
};

// perform putting mark on the board
var putShip = function(obj) {
  var position = obj.classList[obj.classList.length - 1],
      offset = position.indexOf('-'),
      row = position.slice(0, offset),
      column = position.slice(-1),
      possibleGrid = [],
      pos, el;

  if (obj.getElementsByTagName('span').length || obj.getElementsByClassName('dot').length) {
    if (computerTurn && gameType === 'PvC') {

      pos = helper.getPossibleGrid(activeShip);
      el = computerAI.generateComputerBoard(pos);
      putShip(el);
      return;
    }
    else {
      deleteMark(column, row);
      return;
    }
  }

  if (currentShip.size === activeShip.length) {
    return;
  }

  if (activeShip.length) {
    var isValid = false;
    possibleGrid = helper.getPossibleGrid(activeShip);
    for (var i = 0 ; i < possibleGrid.length; i++) {
      if (possibleGrid[i][0] === column && possibleGrid[i][1] == row) {
        isValid = true;
        break;
      }
    }
    
    if (!isValid) {
      return;
    }
  }

  activeShip.push([column, row]);
  helper.getShipOrientation(activeShip);
  helper.sortShip(activeShip);

  var xEl = document.createElement('span');
  obj.appendChild(xEl);
  xEl.classList.add('x');

  if (currentShip.size === activeShip.length && (!computerTurn || gameType === 'PvP')) {
    displayConfirmation();
  }

  if (currentShip.size === activeShip.length && (computerTurn && gameType === 'PvC')) {
    confirmShip(activeShip);
  }

  var inputs = document.getElementsByTagName('input');
  for (var i = 0 ; i < inputs.length ; i++) {
    inputs[i].disabled = true;
  }

  if (computerTurn && activeShip.length && gameType === 'PvC') {
    pos = helper.getPossibleGrid(activeShip);
    el = computerAI.generateComputerBoard(pos);
    putShip(el);
  }
};

// delete mark after clicking on X
var deleteMark = function(column, row) {
  if (isGameOn) return;
  var grid = helper.getActiveBoard(),
      el = grid.getElementsByClassName(row + '-' + column)[0].getElementsByTagName('span')[0];

  for (var i = activeShip.length - 1 ; i >= 0; i--) {
    if (activeShip[i][0] === column && activeShip[i][1] == row) {
      if (i === 0 || i === activeShip.length - 1) { // cannot delete mark inside the ship
        activeShip.splice(i, 1);
        el.parentNode.removeChild(el);
        document.getElementsByClassName('confirmation')[0].classList.add('hidden');
      }
    }
  }
};

var displayConfirmation = function() {
  var confirm = document.getElementsByClassName('confirmation')[0],
      confirmText = confirm.getElementsByTagName('span')[0];

  confirmText.innerHTML = 'Confirm ' + currentShip.name;
  confirm.classList.remove('hidden');
};

var confirmShip = function() {
  var confirm = document.getElementsByClassName('confirmation')[0],
      el;

  confirm.classList.add('hidden');

  markShipOnBoard(activeShip);

  globalShipsArr.push(activeShip);
  activeShip = [];
  if (shipsToPut > 1 ) {
    shipsToPut--;
  }
  else {
    shipCount++;
    currentShip = ships[shipCount];
    if (currentShip) shipsToPut = currentShip.number;
  }

  // filling all remaining grids with dots
  if (!currentShip) {
    var grid = helper.getActiveBoard();
    var allGrids = grid.getElementsByClassName('grid-element');
    for (var i = 0 ; i < allGrids.length ; i++) {
      if (!allGrids[i].getElementsByTagName('span').length) {
        el = document.createElement('span');
        el.classList.add('dot');
        allGrids[i].appendChild(el);
        if (computerTurn && gameType === 'PvC') allGrids[i].classList.add('hidden');
      }
    }
  }

  if (!currentShip && !computerTurn) {
    computerTurn = true;
    shipCount = 0;
    currentShip = ships[0];
    shipsToPut = currentShip.number;
  }
  if (!currentShip && computerTurn) {
    computerShips = globalShipsArr.splice(globalShipsArr.length/2, globalShipsArr.length/2);
    computerTurn = false;

    if (gameType === 'PvP') {
      var grid = document.getElementById('computer-grid').getElementsByClassName('grid-element');

      for (var i = 0 ; i < grid.length ; i++) {
        if (!grid[i].classList.contains('grid-letter') && !grid[i].classList.contains('grid-num')) {
          grid[i].classList.add('hidden');
        }
      }
    }
    startTheGame();
    return;
  }

  if (computerTurn && gameType === 'PvC') {
    el = computerAI.generateComputerBoard();
    putShip(el);
  }
  else if (computerTurn && gameType === 'PvP' && currentShip.size === 5) {
    var userGrid = document.getElementById('user-grid').getElementsByClassName('grid-element'), 
        i;

    for (i = 0 ; i < userGrid.length ; i++) {
      if (!userGrid[i].classList.contains('grid-letter') && !userGrid[i].classList.contains('grid-num')) {
        userGrid[i].classList.add('hidden');
      }
    }

    window.alert('Now second player turn');
    var boxEl = document.getElementById('computer-grid').getElementsByClassName('grid-element');
    for (var i = 0 ; i < boxEl.length ; i++) {
      boxEl[i].addEventListener('click',  function() { putShip(this); });
    }
  }
};

var markShipOnBoard = function(activeShip) {
  var i, el, grid;

  grid = helper.getActiveBoard();
console.log(grid); console.log(computerTurn);
  for (i = 0 ; i < activeShip.length ; i++) {
    el = grid.getElementsByClassName(activeShip[i][1] + '-' + activeShip[i][0])[0].getElementsByTagName('span')[0];
    el.parentNode.classList.add('ship');
    el.parentNode.classList.add(currentShip.name.toLowerCase());
    el.classList.remove('x');

   if (computerTurn && gameType === 'PvC') el.parentNode.classList.add('hidden');
  }

  putDotsAroundShip(activeShip);
};

var putDotsAroundShip = function(activeShip, isShooting) {
  var previousColumn = helper.getShipSurrounding(activeShip)[0],
      nextColumn = helper.getShipSurrounding(activeShip)[1],
      previousRow = helper.getShipSurrounding(activeShip)[2],
      nextRow = helper.getShipSurrounding(activeShip)[3],
      i, j, el;

  var grid = helper.getActiveBoard();
  helper.getShipOrientation(activeShip);

  for (i = previousRow ; i <= nextRow ; i++) {
    for (j = previousColumn.charCodeAt(0) ; j <= nextColumn.charCodeAt(0) ; j++) {
      var column = String.fromCharCode(j),
          pos = grid.getElementsByClassName(i + '-' + column)[0];

      if (pos && isShooting) {
        grid.getElementsByClassName(i + '-' + column)[0].classList.remove('hidden');
      }
      else {
        el = document.createElement('span');

        if (pos && pos.getElementsByTagName('span').length === 0) {
          el.classList.add('dot');
          pos.appendChild(el);
         if (computerTurn && gameType === 'PvC') el.parentNode.classList.add('hidden');
        }
      }
    }
  }
};

// ACTUAL GAME STARTS FROM HERE
var startTheGame = function() {
  window.alert('You are ready to go! Click OK to start shooting at your enemy ships!');
  isGameOn = true;
  var computerGrid = document.getElementById('computer-grid').getElementsByClassName('grid-element'),
      userGrid = document.getElementById('user-grid').getElementsByClassName('grid-element'),
      i;

  for (i = 0 ; i < computerGrid.length ; i++) {
    computerGrid[i].addEventListener('click',  function() { fireShot(this); });
  }

  if (gameType === 'PvP') {
    var playerInfo = document.getElementsByClassName('player-info')[0];
    playerInfo.classList.remove('hidden');

    for (i = 0 ; i < userGrid.length ; i++) {
      var newEl = userGrid[i].cloneNode(true);
      userGrid[i].parentNode.replaceChild(newEl, userGrid[i]);
      userGrid[i].addEventListener('click',  function() { fireShot(this); });
    }
  }
};

var letOpponentShoot = function() {
  if (isGameOn) {
    computerTurn = true;
    var pos = computerAI.makeShot();
    fireShot(pos);
  }
};

var fireShot = function(obj) {
  var pos = obj.classList[1],
      el;

  if (obj.classList.contains('alreadyHit')) {
    if (computerTurn && gameType === 'PvC') {

      pos = computerAI.makeShot();
      fireShot(pos);
      return;
    }
    else {   
      return;
    }
  }

  if (gameType === 'PvP') {
    if (!computerTurn) {
      if (document.getElementById('user-grid').contains(obj)) {
        return;
      }
    }
    else {
      if (document.getElementById('computer-grid').contains(obj)) {
        return;
      }
    }
  }

  obj.classList.add('alreadyHit');
  obj.classList.remove('hidden');

  if ((!computerTurn || gameType === 'PvP') && !isGameEnded) {
    if (obj.classList.contains('ship')) { 
      el = document.createElement('span');
      el.classList.add('x');
      obj.appendChild(el);
      obj.classList.add('not-sunk');
      var shipType = obj.classList[3];
      hitShip(pos, shipType);
    }
    if (gameType === 'PvC') {
      letOpponentShoot();
    }
    else {
      if (isGameOn) computerTurn = !computerTurn;
      var playerInfo = document.getElementsByClassName('player-info')[0];

      if (playerInfo.classList.contains('player1')) {
        playerInfo.classList.remove('player1');
        playerInfo.classList.add('player2');
        playerInfo.innerHTML = 'Player 2 turn';
      }
      else {
        playerInfo.classList.remove('player2');
        playerInfo.classList.add('player1');
        playerInfo.innerHTML = 'Player 1 turn';  
      }
    }
  }
  else if (!isGameEnded && isGameOn) {
    el = obj.getElementsByTagName('span')[0];
    el.classList.remove('dot');
    el.classList.add('x', 'hit');

    if (obj.classList.contains('ship')) {
      computerAI.saveHit(pos);
      hitShip(pos, obj.classList[3]);
    }

    computerTurn = false;
  }
};

var hitShip = function(position, shipType) {
  var i, j, size,
      ship = [],
      offset = position.indexOf('-'),
      row = position.substring(0, offset),
      column = position.substring(position.length - 1, position.length),
      shipsArr = [];

  if (computerTurn) {
    shipsArr = globalShipsArr;
  }
  else {
    shipsArr = computerShips;
  }

  for (i = 0 ; i < ships.length ; i++) {
    if (ships[i].name.toLowerCase() === shipType) {
      size = ships[i].size;
    }
  }

  for (i = 0 ; i < shipsArr.length ; i++) {
    if (shipsArr[i].length === size) {
      ship = shipsArr[i];
      for (j = 0 ; j < ship.length ; j++) {
        if (ship[j][0] === column && ship[j][1] == row) {
          ship[j].hit = true;
          if (!shipsArr[i].hit) {
            ship.hit = 1;
          }
          else {
            ship.hit++;
          }
          if (ship.hit === ship.length) {
            if (computerTurn) {
              opponentScore++;

              if (gameType === 'PvC') {
                window.alert('Your ship has beed destroyed!');
                computerAI.markDestroyedShip(ship);
                computerAI.resetShip();
              }
              else {
                putDotsAroundShip(ship, true);
                for (i = 0 ; i < ship.length ; i++) {
                  var el = document.getElementById('user-grid').getElementsByClassName(ship[i][1] + '-' + ship[i][0])[0],
                      span = el.getElementsByTagName('span')[1];

                  el.classList.remove('not-sunk');
                  el.removeChild(span);
                }
                window.alert('You destroyed player 1 ship!');
              }

            }
            else {
              userScore++;
              putDotsAroundShip(ship, true);

              for (i = 0 ; i < ship.length ; i++) {
                var el = document.getElementById('computer-grid').getElementsByClassName(ship[i][1] + '-' + ship[i][0])[0],
                    span = el.getElementsByTagName('span')[1];

                el.classList.remove('not-sunk');
                el.removeChild(span);
              }

              window.alert('You destroyed hostile ship!');  
            }
            checkWinningConditions();
          } 
        }
      }
    }
  }
};

var checkWinningConditions = function() {
  var shipsToDestroy = 0;
  for (var i = 0 ; i < ships.length ; i++) {
    shipsToDestroy += ships[i].number;
  }

  if (opponentScore === shipsToDestroy) {
    isGameEnded = true;
    isGameOn = false;
    if (gameType === 'PvC') {
      window.alert('You lost!');
    }
    else {
      window.alert('Player 2 won!');
    }
    cleanGame();
  }
  else if (userScore === shipsToDestroy) {
    isGameEnded = true;
    isGameOn = false;
    if (gameType === 'PvC') {
      window.alert('Congratulations! You won!');
    }
    else {
      window.alert('Player 1 won!');
    }
    cleanGame();
  }
};

// prepare game for a new round, after finishing previous one
var cleanGame = function() {
  var grids = document.getElementsByClassName('grid-element'),
      i, j;

  // cleaning DOM
  for (i = 0 ; i < grids.length ; i++) {
    if (!grids[i].classList.contains('grid-letter') && !grids[i].classList.contains('grid-num')) {
      var el = grids[i].getElementsByTagName('span');
      for (j = 0 ; j < el.length ; j++) {
        grids[i].removeChild(el[j]);
      }
      grids[i].classList.remove('alreadyHit', 'ship', 'hidden');

      for (j = 0 ; j < ships.length ; j++) {
        grids[i].classList.remove(ships[j].name.toLowerCase());
      }
    }
  }

  document.getElementsByClassName('player-info')[0].classList.add('hidden');

  var inputs = document.getElementsByTagName('input');
  for (var i = 0 ; i < inputs.length ; i++) {
    inputs[i].disabled = false;
  }

  // cleaning game variables
  activeShip = [];
  rowShip = null;
  columnShip = null;
  currentShip = ships[0];
  globalShipsArr = [];
  computerShips = [];
  shipCount = 0;
  isGameOn = false;
  shipsToPut = null;
  opponentScore = 0;
  userScore = 0;
  computerTurn = false;
  isGameEnded = false;

  computerAI.resetShip();

  // cleaning event listeners
  var computerGrid = document.getElementsByClassName('grids')[0].getElementsByClassName('grid-element');
  for (i = 0 ; i < computerGrid.length ; i++) {
    // cloning element to get rid of attached event listeners
    var newEl = computerGrid[i].cloneNode(true);
    computerGrid[i].parentNode.replaceChild(newEl, computerGrid[i]);
  }

  var boxEl = document.getElementById('user-grid').getElementsByClassName('grid-element');
  for (var i = 0 ; i < boxEl.length ; i++) {
    boxEl[i].addEventListener('click',  function() { putShip(this); });
  }
};

var boxEl = document.getElementById('user-grid').getElementsByClassName('grid-element');
for (var i = 0 ; i < boxEl.length ; i++) {
  boxEl[i].addEventListener('click',  function() { putShip(this); });
}