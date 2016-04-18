'use strict';

// functions in this file are used to gain information about ships
var helper = (function() {

  // check where you can put your mark
  var getPossibleGrid = function(ship) {
    if (!ship.length) return;

    var currentColumn = ship[0][0].charCodeAt(0),
      currentRow = ship[0][1],
      previousColumn = String.fromCharCode(currentColumn - 1),
      nextColumn = String.fromCharCode(currentColumn + 1),
      previousRow = parseInt(currentRow, 10) - 1,
      nextRow = parseInt(currentRow, 10) + 1,
      possibleGrid, i;

    if (ship.length === 1) {
      currentColumn = String.fromCharCode(currentColumn);
      possibleGrid = [[previousColumn, currentRow], [currentColumn, previousRow], [nextColumn, currentRow], [currentColumn, nextRow]];
    }
    else if (ship.length > 1) {
      var rows = [], 
          columns = [];

      for (i = 0 ; i < ship.length ; i++) {
        columns.push(ship[i][0].charCodeAt(0)); // columns are letters
        rows.push(ship[i][1]);
      }

      if (ship[0][0] === ship[1][0]) { // column ship
        var maxRow = Math.max.apply(Math, rows),
            minRow = Math.min.apply(Math, rows);

        currentColumn = ship[0][0];
        previousRow = minRow - 1;
        nextRow = maxRow + 1;

        possibleGrid = [[currentColumn, previousRow], [currentColumn, nextRow]];
      }

      else if (ship[0][1] === ship[1][1]) { // row ship
        var maxColumn = Math.max.apply(Math, columns),
            minColumn = Math.min.apply(Math, columns);

        currentRow = ship[0][1];
        previousColumn = String.fromCharCode(minColumn - 1);
        nextColumn = String.fromCharCode(maxColumn + 1);

        possibleGrid = [[previousColumn, currentRow], [nextColumn, currentRow]];
      }
    }

    if (!isGameOn && possibleGrid) possibleGrid = checkIfFree(possibleGrid);
    return possibleGrid;
  };

  // returning array without grids already used, or not siutable (function user during ship placement by getPossibleGrid func)
  var checkIfFree = function(arr) {
    var grid, i;
    grid = getActiveBoard();

    for (i = arr.length - 1 ; i >= 0 ; i--) {
      var el = grid.getElementsByClassName(arr[i][1] + '-' + arr[i][0])[0];

      if (!el || el.getElementsByTagName('span').length) {
        arr.splice(i, 1);
      }
    }

    var freeGridsInRow = 0,
        freeGridsInColumn = 0;

    if (activeShip.length < 2 && globalShipsArr.length) {
      var column = activeShip[0][0],
          row = parseInt(activeShip[0][1], 10);

      for (i = row + 1 ; i <= 10 ; i++) {
        if (!grid.getElementsByClassName(i + '-' + column)[0].getElementsByTagName('span').length) {
          freeGridsInRow++;
        }
        else {
          break;
        }
      }

      for (i = row - 1 ; i > 0 ; i--) {
        if (!grid.getElementsByClassName(i + '-' + column)[0].getElementsByTagName('span').length) {
          freeGridsInRow++;
        }
        else {
          break;
        }
      }
      if (freeGridsInRow < currentShip.size - 1) {
        for (i = arr.length - 1 ; i >= 0 ; i--) {
          if (parseInt(arr[i][1], 10) !== row) {
            arr.splice(i, 1);
          }
        }
      }

      var columnNumber = column.charCodeAt(0);
      for (i = columnNumber + 1 ; i <= 74 ; i++) { // J is 74 in charCode 
        if (!grid.getElementsByClassName(row + '-' + String.fromCharCode(i))[0].getElementsByTagName('span').length) {
          freeGridsInColumn++;
        }
        else {
          break;
        }
      }

      for (i = columnNumber - 1 ; i > 64 ; i--) { // A is 65 in chatCode
        if (!grid.getElementsByClassName(row + '-' + String.fromCharCode(i))[0].getElementsByTagName('span').length) {
          freeGridsInColumn++;
        }
        else {
          break;
        }
      }

      if (freeGridsInColumn < currentShip.size - 1) {
        for (i = arr.length - 1 ; i >= 0 ; i--) {
          if (arr[i][0] !== column) {
            arr.splice(i, 1);
          }
        }
      }
    }
    return arr;
  };

  //get ship surrounding to mark dots around ship
  var getShipSurrounding = function(ship) {
    var previousColumn, nextColumn, previousRow, nextRow;

    if (ship[1] && ship[0][0] === ship[1][0]) { 
      previousColumn = String.fromCharCode((ship[0][0].charCodeAt(0)) - 1);
      nextColumn = String.fromCharCode((ship[0][0].charCodeAt(0)) + 1);
      previousRow = parseInt(ship[0][1], 10) - 1;
      nextRow = parseInt(ship[ship.length - 1][1], 10) + 1;
    } else if (ship[1] && ship[0][1] === ship[1][1]) {
      previousColumn = String.fromCharCode((ship[0][0].charCodeAt(0)) - 1);
      nextColumn = String.fromCharCode((ship[ship.length - 1][0].charCodeAt(0)) + 1);
      previousRow = parseInt(ship[0][1], 10) - 1;
      nextRow = parseInt(ship[0][1], 10) + 1;
    } else {
      previousColumn = String.fromCharCode((ship[0][0].charCodeAt(0)) - 1);
      nextColumn = String.fromCharCode((ship[0][0].charCodeAt(0)) + 1);
      previousRow = parseInt(ship[0][1], 10) - 1;
      nextRow = parseInt(ship[0][1], 10) + 1;
    }

    return [previousColumn, nextColumn, previousRow, nextRow];
  };

  // decide which board should be interacted 
  // during ship positioning user board should be active, during shooting opponent board
  var getActiveBoard = function() {
    var grid;

    if (isGameOn) {
      if (opponentTurn) {
        grid = document.getElementById('user-grid');
      }
      else {
        grid = document.getElementById('computer-grid');
      }
    }
    else {
      if (opponentTurn) {
        grid = document.getElementById('computer-grid');
      }
      else {
        grid = document.getElementById('user-grid');
      }
    }

    return grid;
  };

  // order ship grids
  var sortShip = function(ship) {
    if (rowShip) {
      ship.sort(function(a, b) { 
        return a[0] > b[0] ? 1 : -1;
      });
    }

    if (columnShip) {
      ship.sort(function(a, b) {
        return a[1] - b[1];
      });
    }
  };

  // checking first two ship grids if ship is in row or column
  var getShipOrientation = function(ship) {
    if (ship.length < 2) return;

    if (ship[1][0] === ship[0][0]) {
      columnShip = true;
      rowShip = false;
    }
    else if (ship[1][1] === ship[0][1]) {
      rowShip = true;
      columnShip = false;
    }
  };

  var toggleInputEnabling = function() {
    var inputs = document.getElementsByTagName('input');
    for (var i = 0 ; i < inputs.length ; i++) {
      if (inputs[i].disabled === true) {
        inputs[i].disabled = false;
        inputs[i].parentNode.classList.remove('disabled');
      }
      else {
        inputs[i].disabled = true;
        inputs[i].parentNode.classList.add('disabled');
      }
    }
  };


  return {
    getPossibleGrid: getPossibleGrid,
    getShipSurrounding: getShipSurrounding,
    getActiveBoard: getActiveBoard,
    sortShip: sortShip,
    getShipOrientation: getShipOrientation,
    toggleInputEnabling: toggleInputEnabling
  };

})();