$(document).ready(start);

var operators = ["+", "-", "x", "\367"];

var operate = {
	"+": function(n1, n2) { return parseFloat(n1) + parseFloat(n2); },
	"-": function(n1, n2) { return n1 - n2; },
	"x": function(n1, n2) { return n1 * n2; },
	"\367": function(n1, n2) { return n1 / n2; }
};

function start() {
	listenForNumbers();
	listenForCalc();
	listenForCancel();
  listenForKeys();
}

function listenForNumbers() {
	$(".buttons span").not("#cancel").not("#calc").on("click", inputNumOrOp);
}

function inputNumOrOp(event) {
  var $inputs = $("#screen");
  var inputs = $inputs.text();
  var clickedInput = $(this).text();
  var lastInput = inputs.slice(-1);
  if (inputs.length <= 14) {
    if (isOp(clickedInput)) {
      if (!isOp(lastInput)) {
        $inputs.append(clickedInput);
      }
    }
    else {
      $inputs.append(clickedInput);
    }
  }
}

// 0-9:48-57  =:61  return:13  +:43  -:45  *:42  /:47
function listenForKeys() {

  $(window).on("keyup", function(event) {
    var $inputs = $("#screen");
    var inputs = $inputs.text();
    if (event.keyCode === 27) {
      $("#screen").text("");
    }
    else if (event.keyCode === 8) {
      $inputs.text(inputs.slice(0,inputs.length-1));
    }
  });
  $(window).on("keypress", function(event) {
    var $inputs = $("#screen");
    var inputs = $inputs.text();
    var lastInput = inputs.slice(-1);
    var key = String.fromCharCode(event.keyCode);
    
    if (event.keyCode === 13 || key === "=") {
      calc();
    }
    else if (inputs.length <= 14) {
      if (0 <= key && key <= 9) {
        $inputs.append(key);
      }
      else if (!isOp(lastInput)) {
        if(key === "+" || key === "-") {
          $inputs.append(key);
        }
        else if (key === "*") {
          $inputs.append("x");
        }
        else if (key === "/") {
          $inputs.append("\367");
        }
      }
    }
  });
}

function listenForCalc() {
	$("#calc").on("click", calc);
}

function calc() {
  var $input = $("#screen");
  var lastInput = $input.text().slice(-1);
  var result;
  if (!isOp(lastInput)) {
    result = calculate($input.text());
    if (result.toString().length > 13)
      result = result.toFixed(13);
    $input.text(result);
  }
}

function listenForCancel() {
	$("#cancel").on("click", function() {
		$("#screen").text("");
	});
}

function calculate(input) {
  var num1, num2, item, numLen, opLen;
  var stack = parseStr(input);
  var numS = [stack.pop()];

  if (!stack.length) return $("#screen").text();
  
  var opS = [stack.pop()];

  while (stack.length) {
    item = stack.pop();
    if (isOp(item)) {
      while (opS.length > 0 && numS.length >= 2 && pemdas(item,opS[opS.length - 1])) {
        numS.push(operate[opS.pop()](numS.pop(),numS.pop()));
      }
      opS.push(item);
    }
    else {
      numS.push(item);
    }
  }

  while (opS.length) {
    numS.push(operate[opS.pop()](numS.pop(),numS.pop()));
  }

  return numS.pop();
}

function parseStr(str) {
  var temp = "";
  var numsAndOps = str.split("").reduce(function(numsAndOps, el) {
    if (isNaN(parseInt(el))) {
      numsAndOps.push(temp);
      numsAndOps.push(el);
      temp = "";
      return numsAndOps;
    }
    else {
      temp += el;
      return numsAndOps;
    }
  },[]);
  numsAndOps.push(temp);
  return numsAndOps;
}

function isOp(ch) {
  return operators.indexOf(ch) !== -1;
}

function pemdas(curOp, stackOp) {
  if (curOp === "+") {
    return true;
  }
  else if (stackOp === "x" || stackOp === "\367") {
    return true;
  }
  return false;
}