'use strict';

var computerAI = (function() {
  var columnArray = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
      shotArray = [];

  var helper = window.helper;

  var generateComputerBoard = function(possiblePositions) {
    var randomRow = Math.floor(Math.random() * 10) + 1,
        randomColumn = columnArray[Math.floor(Math.random() * 10)];
        
      if (possiblePositions && possiblePositions.length) {
        var chosenGrid = possiblePositions[Math.floor(Math.random() * (possiblePositions.length))];
        return document.getElementById('computer-grid').getElementsByClassName(chosenGrid[1] + '-' + chosenGrid[0])[0];
      }
      else {
        var compGrid = document.getElementById('computer-grid'),
            randomGrid = compGrid.getElementsByClassName(randomRow + '-' + randomColumn)[0];

        return randomGrid;
      }
  };

  var makeShot = function() {
    var grid, randomGrid;

    if (!shotArray.length) {
      var randomRow = Math.floor(Math.random() * 10) + 1,
          randomColumn = columnArray[Math.floor(Math.random() * 10)];

      grid = document.getElementById('user-grid');
      randomGrid = grid.getElementsByClassName(randomRow + '-' + randomColumn)[0];

      if (randomGrid.classList.contains('alreadyHit') || randomGrid.classList.contains('grid-letter') || randomGrid.classList.contains('grid-num')) {
        makeShot();
      }
      return randomGrid;
    }
    else {
      var i;
      
      grid = document.getElementById('user-grid');
      var possibleGrid = helper.getPossibleGrid(shotArray);

      for (i = possibleGrid.length - 1 ; i >= 0 ; i--) {
        var pos = grid.getElementsByClassName(possibleGrid[i][1] + '-' + possibleGrid[i][0])[0];
        if (!pos || pos.classList.contains('alreadyHit') || pos.classList.contains('grid-letter') || pos.classList.contains('grid-num')) {
          possibleGrid.splice(i, 1);
        }
      }
      randomGrid = possibleGrid[Math.floor(Math.random() * (possibleGrid.length))];
      return document.getElementById('user-grid').getElementsByClassName(randomGrid[1] + '-' + randomGrid[0])[0];
    }
  };

  var saveHit = function(pos) {
    var offset = pos.indexOf('-'),
        row = pos.substring(0, offset),
        column = pos.substring(pos.length - 1, pos.length);

    shotArray.push([column, row]);
  };

  var markDestroyedShip = function(ship) {
    var previousColumn = helper.getShipSurrounding(ship)[0],
        nextColumn = helper.getShipSurrounding(ship)[1],
        previousRow = helper.getShipSurrounding(ship)[2],
        nextRow = helper.getShipSurrounding(ship)[3];

    for (var i = previousRow ; i <= nextRow ; i++) {
      for (var j = previousColumn.charCodeAt(0) ; j <= nextColumn.charCodeAt(0) ; j++) {
        var column = String.fromCharCode(j),
            pos = document.getElementById('user-grid').getElementsByClassName(i + '-' + column)[0];

        if (pos) {
          var el = pos.getElementsByTagName('span')[0];
          el.classList.remove('dot');

          if (!pos.classList.contains('grid-num') && !pos.classList.contains('grid-letter')) {
            pos.classList.add('alreadyHit');
            el.classList.add('x', 'hit');
          }
        }
      }
    }

  };

  var getShip = function() {
    return shotArray;
  };

  var resetShip = function() {
    shotArray = [];
  };

  return {
    generateComputerBoard: generateComputerBoard,
    makeShot: makeShot,
    saveHit: saveHit,
    markDestroyedShip: markDestroyedShip,
    getShip: getShip,
    resetShip: resetShip
  };

})();