import React from 'react';

const Board = (props) => {
  var canvas = document.getElementsByClassName('whiteboard')[0];
  var colors = document.getElementsByClassName('color');
  var context = canvas.getContext('2d');

  var current = {
    color: 'black'
  };
  var drawing = false;

  canvas.addEventListener('mousedown', props.onMouseDown, false);
  canvas.addEventListener('mouseup', props.onMouseUp, false);
  canvas.addEventListener('mouseout', props.onMouseUp, false);
  canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);
  
  //Touch support for mobile devices
  canvas.addEventListener('touchstart', props.onMouseDown, false);
  canvas.addEventListener('touchend', props.onMouseUp, false);
  canvas.addEventListener('touchcancel', props.onMouseUp, false);
  canvas.addEventListener('touchmove', throttle(props.onMouseMove, 10), false);

  for (var i = 0; i < colors.length; i++){
    colors[i].addEventListener('click', props.onColorUpdate, false);
  }

  return(
    <canvas class="whiteboard" ></canvas>
    <div class="colors">
      <div class="color black"></div>
      <div class="color red"></div>
      <div class="color green"></div>
      <div class="color blue"></div>
      <div class="color yellow"></div>
    </div>
  )
}

export default Board;