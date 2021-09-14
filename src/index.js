import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { ButtonToolbar, DropdownButton } from "react-bootstrap";

class Box extends React.Component {
  selectBox = () => {
    this.props.selectBox(this.props.row, this.props.col);
  };

  render() {
    return (
      <div
        className={this.props.boxClass}
        id={this.props.id}
        onClick={this.selectBox}
      />
    );
  }
}

class Grid extends React.Component {
  render() {
    const width = this.props.cols * 14;
    let rowsArr = [];

    let boxClass = "";
    //the below loop will set an id and class for each cell in the grid(2d array)
    //id will be "i_j" and class will be either "box on"/"box off"
    for (let i = 0; i < this.props.rows; i++) {
      for (let j = 0; j < this.props.cols; j++) {
        let boxId = i + "_" + j;
        boxClass = this.props.gridFull[i][j] ? "box on" : "box off";
        rowsArr.push(
          <Box
            boxClass={boxClass}
            key={boxId}
            boxId={boxId}
            row={i}
            col={j}
            selectBox={this.props.selectBox}
          />
        );
      }
    }

    return (
      <div className="grid" style={{ width: width, maxWidth: "90vw" }}>
        {rowsArr}
      </div>
    );
  }
}

class Buttons extends React.Component {
  handelSelect = (evt) => {
    this.props.gridSize(evt);
  };

  render() {
    return (
      <div className="center">
        <ButtonToolbar>
          <button
            className="btn btn-danger m-2"
            onClick={this.props.playButton}
          >
            Play
          </button>
          <button
            className="btn btn-danger m-2"
            onClick={this.props.pauseButton}
          >
            Pause
          </button>
          <button className="btn btn-danger m-2" onClick={this.props.clear}>
            Clear
          </button>
          <button className="btn btn-danger m-2" onClick={this.props.slow}>
            Slow
          </button>
          <button className="btn btn-danger m-2" onClick={this.props.fast}>
            Fast
          </button>
          <button className="btn btn-danger m-2" onClick={this.props.seed}>
            Seed
          </button>
          <DropdownButton
            title="Grid-size"
            id="size-menu"
            onSelect={this.handelSelect}
          >
            <menuItem eventKey="1">20x10</menuItem>
            <menuItem eventKey="2">50x30</menuItem>
            <menuItem eventKey="3">70x50</menuItem>
          </DropdownButton>
        </ButtonToolbar>
      </div>
    );
  }
}

class Main extends React.Component {
  constructor() {
    super();
    this.speed = 100;
    this.rows = 30;
    this.cols = 50;

    this.state = {
      generation: 0,
      //this is gonna create a 2d array of 30x50 initialized with false
      gridFull: Array(this.rows)
        .fill()
        .map(() => Array(this.cols).fill(false)),
    };
  }

  selectBox = (row, col) => {
    //making a clone of the grid
    let gridCopy = arrayClone(this.state.gridFull);
    //switching the state
    gridCopy[row][col] = !gridCopy[row][col];
    //coping the new grid
    this.setState({
      gridFull: gridCopy,
    });
  };

  seed = () => {
    //setting the initial state
    let gridCopy = arrayClone(this.state.gridFull);
    //going through each grid and randomly choosing the initial condition(weather true/false)
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        //gnerating a random number between 0-4
        //setting true if it's 1(20% chance of getting true)
        if (Math.floor(Math.random() * 5) === 1) gridCopy[i][j] = true;
      }
    }
    //coping the new grid
    this.setState({
      gridFull: gridCopy,
    });
  };

  pauseButton = () => {
    clearInterval(this.intervalId);
  };

  playButton = () => {
    clearInterval(this.intervalId);
    this.intervalId = setInterval(this.play, this.speed);
  };

  slow = () => {
    this.speed = 1000;
    this.playButton();
  };

  fast = () => {
    this.speed = 100;
    this.playButton();
  };

  clear = () => {
    let grid = Array(this.rows)
      .fill()
      .map(() => Array(this.cols).fill(false));

    this.setState({
      gridFull: grid,
      generation: 0,
    });
  };

  gridSize = (size) => {
    switch (size) {
      case "1":
        this.cols = 20;
        this.rows = 10;
        break;
      case "2":
        this.cols = 50;
        this.rows = 30;
        break;
      default:
        this.cols = 70;
        this.rows = 50;
        break;
    }
    this.clear();
  };

  play = () => {
    //first we make two copies of the grid.
    //to compare and decide, the next generation
    let g = this.state.gridFull;
    let g2 = arrayClone(this.state.gridFull);

    //rules
    //#1 any live cell with fewer than two live neighbours dies,
    // as if by underpopulation
    //#2 any live cell with two or three live neighbours lives on to the next generation.
    //#3 any live cell with more than three live neighbours dies,
    //as if by underpopulation.
    //#4 any dead cell with exactly three live neighbours become a live cell,
    //as if by reproduction.

    for (let i = 1; i < this.rows - 1; i++) {
      for (let j = 1; j < this.cols - 1; j++) {
        let count = 0;
        //counting the live cells around each cell
        if (g[i - 1][j - 1]) count++;
        if (g[i - 1][j]) count++;
        if (g[i - 1][j + 1]) count++;
        if (g[i][j - 1]) count++;
        if (g[i][j + 1]) count++;
        if (g[i + 1][j - 1]) count++;
        if (g[i + 1][j]) count++;
        if (g[i + 1][j + 1]) count++;

        //setting the new value
        //#1 and #3
        if (g[i][j] && (count < 2 || count > 3)) g2[i][j] = false;
        //#4
        if (!g[i][j] && count === 3) g2[i][j] = true;
      }
    }

    this.setState({
      gridFull: g2,
      generation: this.state.generation + 1,
    });
  };

  componentDidMount() {
    this.seed();
    this.playButton();
  }

  render() {
    return (
      <div style={{ padding: "1rem" }}>
        <h1 style={{ marginTop: 0 }}>The Game of Life</h1>
        <p style={{ marginTop: 10, color: "darkgreen", textAlign: "center" }}>
          it is a cellular automaton devised by the British mathematician John
          Horton Conway in 1970.It is a zero-player game, meaning that its
          evolution is determined by its initial state, requiring no further
          input. One interacts with the Game of Life by creating an initial
          configuration and observing how it evolves.
        </p>
        <Buttons
          playButton={this.playButton}
          pauseButton={this.pauseButton}
          slow={this.slow}
          fast={this.fast}
          clear={this.clear}
          seed={this.seed}
          gridSize={this.gridSize}
        />
        <Grid
          gridFull={this.state.gridFull}
          rows={this.rows}
          cols={this.cols}
          selectBox={this.selectBox}
        />
        <h2 style={{ color: "darkgreen" }}>
          Generation: {this.state.generation}
        </h2>
      </div>
    );
  }
}

function arrayClone(arr) {
  return JSON.parse(JSON.stringify(arr));
}

ReactDOM.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
  document.getElementById("root")
);
