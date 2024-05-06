'use strict'

var gBoard = []
var gLevel
var gGame
var gIntervalTime
var gBestScore = { begginer: 0, medium: 0, expert: 0 }
var gPreSteps = { preBoard: [], preGame: [] }
var gMegaHint = { isOn: false, startPoint: { i: null, j: null }, countUse: 1 }

function startGame(i, j) {
  gMegaHint = { isOn: false, startPoint: { i: null, j: null }, countMegaHint: 1 }
  gPreSteps = { preBoard: [], preGame: [] }
  gGame = { isOn: true, shownCount: 0, markedCount: 0, timeStart: new Date(), lifeLeft: 3, countHint: 3, isHintOn: false, countSafe: 3, countExterminator: 1 }
  setEmptyCell(i, j)
  setMinesOnBoard(gBoard, i, j)
  setMinesNegsCount(gBoard)
  setEmptyCell(i, j)
  expandShown(gBoard, i, j)
  renderBoard(gBoard)
  gIntervalTime = setInterval(setTimeLeft, 1000)
  setTimeLeft()
  setFlagsLeft()
  setLifeLeft()
  setHintsLeft()
  setSafeLeft()
  setPreviousMode()
  setMineExtermintorBtn()
  setMegaHintBtn()
  gPreSteps.preBoard.push(JSON.parse(JSON.stringify(gBoard)))
  gPreSteps.preGame.push(JSON.parse(JSON.stringify(gGame)))
}

function setEmptyCell(i, j) {
  gBoard[i][j].minesAroundCount = 0
}

function setLevel(sizeBoard, countMines, level) {
  gLevel = { SIZE: sizeBoard, MINES: countMines, level: level, score: 100000 }
  resetGame()

  var elBtnBegginer = document.querySelector('.begginer')
  var elBtnMedium = document.querySelector('.medium')
  var elBtnExpert = document.querySelector('.expert')
  var elBtnManual = document.querySelector('.manual-mode')

  if (level === 'Begginer') {
    elBtnBegginer.classList.add('level-selected')
    elBtnMedium.classList.remove('level-selected')
    elBtnExpert.classList.remove('level-selected')
    elBtnManual.classList.remove('level-selected')
  } else if (level === 'Medium') {
    elBtnMedium.classList.add('level-selected')
    elBtnBegginer.classList.remove('level-selected')
    elBtnExpert.classList.remove('level-selected')
    elBtnManual.classList.remove('level-selected')
  } else if (level === 'Expert') {
    elBtnExpert.classList.add('level-selected')
    elBtnBegginer.classList.remove('level-selected')
    elBtnMedium.classList.remove('level-selected')
    elBtnManual.classList.remove('level-selected')
  } else {
    elBtnExpert.classList.remove('level-selected')
    elBtnBegginer.classList.remove('level-selected')
    elBtnMedium.classList.remove('level-selected')
    elBtnManual.classList.add('level-selected')
    console.log('aaa')
  }
}
function resetGame() {
  clearInterval(gIntervalTime)
  gBoard = []
  buildBoard()
  renderStartBoard()
  gLevel.score = 100000
  const elSmilly = document.querySelector('.smile')
  elSmilly.textContent = '😀'
  elSmilly.classList.remove('hide')
}
function buildBoard() {
  for (var i = 0; i < gLevel.SIZE; i++) {
    gBoard.push([])
    for (var j = 0; j < gLevel.SIZE; j++) {
      gBoard[i].push({ minesAroundCount: 0, isShown: false, isMine: false, isMarked: false })
    }
  }
}

function renderStartBoard(board) {
  var strHTML = ''
  for (var i = 0; i < gLevel.SIZE; i++) {
    strHTML += '<tr>'
    for (var j = 0; j < gLevel.SIZE; j++) {
      const className = `cell cell-${i}-${j}`
      strHTML += `<td class="${className}" onclick="startGame(${i},${j})"></td>`
    }
    strHTML += '</tr>'
  }
  const elBoard = document.querySelector('.board')
  elBoard.innerHTML = strHTML
}

function setMinesNegsCount(board) {
  var cells = []
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (!board[i][j].isMine) board[i][j].minesAroundCount = isNegsMines(i, j)
    }
  }
}

function isNegsMines(iPos, jPos) {
  var countMines = 0
  for (var i = Math.max(iPos - 1, 0); i <= Math.min(iPos + 1, gBoard.length - 1); i++) {
    for (var j = Math.max(jPos - 1, 0); j <= Math.min(jPos + 1, gBoard.length - 1); j++) {
      if (gBoard[i][j].isMine) countMines++
    }
  }
  return countMines
}

function checkGameOver() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if ((gBoard[i][j].isMine && gBoard[i][j].isMarked) || (gBoard[i][j].minesAroundCount > -1 && gBoard[i][j].isShown)) {
      } else return
    }
  }
  clearInterval(gIntervalTime)
  gLevel.score = gLevel.score - 100 * calculateTimeElapsedInSeconds(gGame.timeStart)
  setInfo(`You Won!! Congratulations 😎 you Scored ` + gLevel.score)
  const elSmilly = document.querySelector('.smile')
  elSmilly.textContent = '😎'
  gGame.isOn = false
  setScore()
}
function onClicked(i, j) {
  if (gGame.isHintOn) {
    useHint(i, j)
    return
  }
  if (gGame.isOn) {
    gPreSteps.preBoard.push(JSON.parse(JSON.stringify(gBoard)))
    gPreSteps.preGame.push(JSON.parse(JSON.stringify(gGame)))
    if (gMegaHint.isOn) {
      if (gMegaHint.startPoint.i === null) {
        useMegaHint({ i: i, j: j })
      } else useMegaHint(gMegaHint.startPoint, { i: i, j: j })
      return
    }

    if (gBoard[i][j].isMine && gGame.lifeLeft === 1) {
      gBoard[i][j].isShown = true
      gameOver()
    } else {
      if (gBoard[i][j].isMine) {
        gGame.lifeLeft--
        setLifeLeft()
        setInfo(`you hit mine 💥 left with ${gGame.lifeLeft} lives 💗`)
        gLevel.score -= 2000
        return
      }
      expandShown(gBoard, i, j)
      checkGameOver()
    }
    renderBoard(gBoard)
  }
}

function onCellMarked(i, j) {
  if (gGame.isOn) {
    if (gBoard[i][j].isMarked) {
      gGame.markedCount--
    }
    if (gGame.markedCount === gLevel.MINES) return
    if (!gBoard[i][j].isMarked) {
      gGame.markedCount++
    }
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked
    checkGameOver()
    renderBoard(gBoard)
    setFlagsLeft()
  }
}

function expandShown(board, iPos, jPos) {
  if (board[iPos][jPos].isShown || board[iPos][jPos].isMarked) return
  board[iPos][jPos].isShown = true
  if (board[iPos][jPos].minesAroundCount > 0) return

  for (var i = iPos - 1; i <= iPos + 1; i++) {
    for (var j = jPos - 1; j <= jPos + 1; j++) {
      if (i >= 0 && i < board.length && j >= 0 && j < board.length && (i - iPos) * (j - jPos) === 0 && (i !== iPos || j !== jPos)) {
        if (board[i][j].minesAroundCount == false) expandShown(board, i, j)
        else if (board[i][j].minesAroundCount > 0) {
          board[i][j].isShown = true
        }
      }
    }
  }
}

function exposeMines() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].isMine) gBoard[i][j].isShown = true
    }
  }
}

function renderBoard(board) {
  var strHTML = ''
  for (var i = 0; i < gLevel.SIZE; i++) {
    strHTML += '<tr>'
    for (var j = 0; j < gLevel.SIZE; j++) {
      var symbol = ''
      if (gBoard[i][j].isMine) {
        symbol = '💣'
      } else if (gBoard[i][j].minesAroundCount > 0) {
        symbol = gBoard[i][j].minesAroundCount.toString()
      }

      const className = `cell cell-${i}-${j}`
      if (board[i][j].isShown && !board[i][j].isMine) {
        strHTML += `<td class="${className} shown">${symbol}</td>`
      } else if (board[i][j].isShown && board[i][j].isMine) {
        strHTML += `<td class="${className} shown bomb">${symbol}</td>`
      } else if (board[i][j].isMarked) {
        strHTML += `<td class="${className}" oncontextmenu="event.preventDefault(); onCellMarked(${i},${j})"  >❌</td>`
      } else {
        strHTML += `<td class="${className}" onclick="onClicked(${i},${j})" oncontextmenu="event.preventDefault(); onCellMarked(${i},${j})"></td>`
      }
    }
    strHTML += '</tr>'
  }
  const elBoard = document.querySelector('.board')
  elBoard.innerHTML = strHTML
}
function setMinesOnBoard(board, iPos, jPos) {
  var cells = findEmptyCells(iPos, jPos)
  for (var i = 0; i < gLevel.MINES; i++) {
    const rndCell = getRandomIntInclusive(0, cells.length - 1)
    const minePos = cells[rndCell]
    board[minePos.i][minePos.j].isMine = true
    board[minePos.i][minePos.j].minesAroundCount = -1
    cells.splice(rndCell, 1)
  }
}

function findEmptyCells(iPos, jPos) {
  var cells = []
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard.length; j++) {
      if (i > iPos + 1 || i < iPos - 1 || j > jPos + 1 || j < jPos - 1) cells.push({ i: i, j: j })
    }
  }
  return cells
}

function gameOver() {
  gLevel.score = 0
  setInfo(`Game Over 🤯 you Scored ` + gLevel.score)
  const elSmilly = document.querySelector('.smile')
  elSmilly.textContent = '🤯'
  exposeMines()
  gGame.isOn = false
  clearInterval(gIntervalTime)
}

function setTimeLeft() {
  if (gGame.isOn) {
    const elTime = document.querySelector('.time')
    elTime.textContent = '🕰️' + calculateTimeElapsed(gGame.timeStart)
  }
}
function setFlagsLeft() {
  const elFlags = document.querySelector('.flags')
  elFlags.textContent = '🚩' + (gLevel.MINES - gGame.markedCount)
}
function setLifeLeft() {
  const elLife = document.querySelector('.life')
  elLife.textContent = '💗' + gGame.lifeLeft
}
function setHintsLeft() {
  const elHint = document.querySelector('.hint')
  elHint.innerHTML = `<td class="hint" onclick="runHint()" title="hints left">💡 ${gGame.countHint}</td>`
}
function setSafeLeft() {
  const elHint = document.querySelector('.safe-mode')
  elHint.innerHTML = `<td class="safe-mode" onclick="showSafeCell()" title="safe mode left">🛡️ ${gGame.countSafe}</td>`
}
function setPreviousMode() {
  const elHint = document.querySelector('.previous-move')
  elHint.innerHTML = `<td class="previous-move" title="Get to previous move" onclick="undoStep()">♻️</td>`
}
function setMineExtermintorBtn() {
  const elExterminator = document.querySelector('.mine-exterminator')
  elExterminator.innerHTML = `<td class="mine-exterminator" title="Eliminate 3 of existing mines randomly" onclick="mineExterminator()">💣 ${gGame.countExterminator}</td>`
}
function setMegaHintBtn() {
  const elExterminator = document.querySelector('.mega-hint')
  elExterminator.innerHTML = `<td class="mega-hint" title="reaveal an area of the board for 2 seconds" onclick="useMegaHint()">🔎 ${gMegaHint.countMegaHint}</td>`
}

function runHint() {
  if (!gGame.isOn && gGame.isHintOn) {
    setInfo(`you turned off hint mode`)
    gGame.isHintOn = false
    gGame.countHint++
    gGame.isOn = true
  } else {
    if (gGame.countHint > 0 && gGame.isOn) {
      setInfo(`you turned on hint mode`)
      gGame.isHintOn = true
      gGame.countHint--
      gGame.isOn = false
    }
  }
  setHintsLeft()
}

function useHint(iPos, jPos) {
  for (var i = iPos - 1; i <= iPos + 1; i++) {
    for (var j = jPos - 1; j <= jPos + 1; j++) {
      if (i >= 0 && j >= 0 && i < gBoard.length && j < gBoard.length) renderCell(i, j)
    }
  }

  gGame.isHintOn = false
  setTimeout(() => {
    gGame.isOn = true
    renderBoard(gBoard)
    setInfo(`you left with ${gGame.countHint} hints 💡`)
    gLevel.score -= 1000
  }, 1000)
}
function renderCell(i, j) {
  var symbol = ''
  if (gBoard[i][j].isMine) {
    symbol = '💣'
  } else if (gBoard[i][j].minesAroundCount > 0) {
    symbol = gBoard[i][j].minesAroundCount.toString()
  }
  const className = `cell cell-${i}-${j}`
  const htmlCode = `<td class="${className}">${symbol}</td>`
  const elCell = document.querySelector(`.cell-${i}-${j}`)
  elCell.innerHTML = htmlCode
}

function setInfo(info) {
  const elInfo = document.querySelector(`.info`)
  elInfo.classList.remove('hide')
  elInfo.textContent = info
  setTimeout(() => {
    elInfo.classList.add('hide')
  }, 2000)
}

function setScore() {
  if (gLevel.level === 'Begginer') {
    if (gBestScore.begginer < gLevel.score) {
      gBestScore.begginer = gLevel.score
      const elScore = document.querySelector(`.begginer-score`)
      elScore.textContent = 'Begginer: ' + gLevel.score
    }
  } else if (gLevel.level === 'Medium') {
    if (gBestScore.medium < gLevel.score) {
      gBestScore.medium = gLevel.score
      const elScore = document.querySelector(`.medium-score`)
      elScore.textContent = 'Medium: ' + gLevel.score
    }
  } else if (gLevel.level === 'Expert') {
    if (gBestScore.expert < gLevel.score) {
      gBestScore.expert = gLevel.score
      const elScore = document.querySelector(`.expert-score`)
      elScore.textContent = 'Expert: ' + gLevel.score
    }
  } else {
    if (gBestScore.expert < gLevel.score) {
      gBestScore.expert = gLevel.score
      const elScore = document.querySelector(`.manual-score`)
      elScore.textContent = 'Manual mode: ' + gLevel.score
    }
  }
  gBestScore
}
function undoStep() {
  if (gGame.isOn) {
    if (gPreSteps.preGame.length === 0) setInfo('Sorry, you cant to undo mroe ♻️')
    else {
      var timeStart = gGame.timeStart
      gGame = gPreSteps.preGame.pop()
      gGame.timeStart = timeStart
      gBoard = gPreSteps.preBoard.pop()
      renderBoard(gBoard)
      setFlagsLeft()
      setLifeLeft()
      setHintsLeft()
      setSafeLeft()
      setPreviousMode()
      setMineExtermintorBtn()
      setMegaHintBtn()
    }
  }
}

function showSafeCell() {
  if (gGame.isOn && gGame.countSafe > 0) {
    var cells = []
    for (var i = 0; i < gBoard.length; i++) {
      for (var j = 0; j < gBoard[0].length; j++) {
        if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) cells.push({ i: i, j: j })
      }
    }
    var randCell = cells[getRandomIntInclusive(0, cells.length - 1)]
    const elCell = document.querySelector(`.cell-${randCell.i}-${randCell.j}`)
    elCell.classList.toggle('green')
    setTimeout(() => {
      elCell.classList.toggle('green')
    }, 3000)
    gGame.countSafe--
    setInfo(`you left with ${gGame.countSafe} safes 🛡️`)
    setSafeLeft()
  }
}

function mineExterminator() {
  if (gGame.isOn) {
    if (gGame.countExterminator > 0) {
      var mines = []
      for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
          if (gBoard[i][j].isMine && !gBoard[i][j].isMarked) mines.push({ i: i, j: j })
        }
      }
      for (var n = 0; n < 3 && gLevel.MINES > 0; n++) {
        var randCell = mines[getRandomIntInclusive(0, mines.length - 1)]
        gBoard[randCell.i][randCell.j] = { minesAroundCount: 0, isShown: false, isMine: false, isMarked: false }
        gLevel.MINES--
      }

      setMinesNegsCount(gBoard)
      renderBoard(gBoard)
      setFlagsLeft()
      gGame.countExterminator--
      setInfo(`you left with ${gGame.countExterminator} mine exterminators 💣`)
      setMineExtermintorBtn()
    }
  }
}
function useMegaHint(startPos = null, endPos = null) {
  if (gGame.isOn) {
    if (!gMegaHint.isOn && gMegaHint.countMegaHint > 0 && startPos === null) {
      gMegaHint = { isOn: true, startPoint: { i: null, j: null }, countMegaHint: gMegaHint.countMegaHint - 1 }
      setMegaHintBtn()
      renderBoard(gBoard)
      setInfo(`you turned on mega hint mode🔎`)
    } else if (startPos === null && gMegaHint.isOn) {
      gMegaHint = { isOn: false, startPoint: { i: null, j: null }, countMegaHint: gMegaHint.countMegaHint + 1 }
      setMegaHintBtn()
      renderBoard(gBoard)
      setInfo(`you turned off mega hint mode🔎`)
    } else if (endPos === null && gMegaHint.isOn) {
      const elCell = document.querySelector(`.cell-${startPos.i}-${startPos.j}`)
      elCell.classList.toggle('green')
      gMegaHint.startPoint = startPos
    } else if (gMegaHint.isOn) {
      if (startPos.i === endPos.i && startPos.j === endPos.j) {
        gMegaHint = { isOn: true, startPoint: { i: null, j: null }, countMegaHint: gMegaHint.countMegaHint }
        renderBoard(gBoard)
      }

      gMegaHint = { isOn: false, startPoint: { i: null, j: null }, countMegaHint: gMegaHint.countMegaHint }
      setMegaHintBtn()
      renderBoard(gBoard)
      for (var i = Math.min(startPos.i, endPos.i); i <= Math.max(startPos.i, endPos.i); i++) {
        for (var j = Math.min(startPos.j, endPos.j); j <= Math.max(startPos.j, endPos.j); j++) {
          renderCell(i, j)
        }
      }
      setTimeout(() => {
        renderBoard(gBoard)
        setInfo(`you left with ${gMegaHint.countMegaHint} mega hints 🔎`)
      }, 1000)
    }
  }
}
