
// ----------------------------------
// GLOBALS / BRUSH OPTIONS
// ----------------------------------

var fabricPainter = {};
fabricPainter.brush_globals = {
	set: function(prop, val) {
		fabricPainter.brush_globals[prop] = val;
	},
	size: 50,
	opacity: 0.2,
	color: '#ff9300',
	pattern: false,
	angle: 0,
	outline: false,
	brush_type: 'circle',
	is_drawing: false,
	current_brush: null
},
fabricPainter.paint_settings = {
	points: [],
	max_trace_factor: 4
};

// ----------------------------------
// BASIC UTILITIES
// ----------------------------------

fabricPainter.rnd = function(number) {
	return Math.floor(Math.random() * number);
};

fabricPainter.toggleProperty = function(property) {
	console.log('toggling ... ' + property + ' from ' + fabricPainter.brush_globals[property] + ' to ' + (!fabricPainter.brush_globals[property]));
	if(fabricPainter.brush_globals[property]) {
		fabricPainter.brush_globals[property] = false;
	} else {
		fabricPainter.brush_globals[property] = true;
	}
	return;
};

fabricPainter.triggerPaintTextureMode = function(pattern_file_name) {
	// turn on drawing mode
	var img, texture_pattern_brush;
	canvas.isDrawingMode = fabricPainter.brush_globals.is_drawing;

	// setup new image
	img = new Image();
	img.src = pattern_file_name;

	// create brush
	texture_pattern_brush = new fabric.PatternBrush(canvas);
	texture_pattern_brush.source = img;
	texture_pattern_brush.width = fabricPainter.brush_globals.size;

	// defer to object for brush type
	fabricPainter.brush_globals.current_brush = texture_pattern_brush;
	canvas.freeDrawingBrush = fabricPainter.brush_globals.current_brush;
	return;
};

fabricPainter.addSquare = function(data, top, left, angle, height, width) {
	canvas.add(new fabric.Rect({
		top: top || data.e.layerY || Math.random()*canvas.width,
		left: left || data.e.layerX || Math.random()*canvas.width,
		angle: angle || fabricPainter.brush_globals.angle,
		height: height || 100,
		width: width || 100,
		hasControls: false,
		hasBorders: false,
		selectable: false,
		strokeWidth: (fabricPainter.brush_globals.outline ? 0 : 2),
		stroke: (fabricPainter.brush_globals.outline ? fabricPainter.brush_globals.color : 'none'),
		fill: (fabricPainter.brush_globals.outline ? 'none' : fabricPainter.brush_globals.color),
		opacity: fabricPainter.brush_globals.opacity
	}));
	canvas.renderAll();
	return;
};

fabricPainter.addCircle = function(top, left, radius) {
	canvas.add(new fabric.Circle({
		top: top || radius * 3,
		left: left || radius * 3,
		radius: radius,
		hasControls: false,
		hasBorders: false,
		selectable: false,
		angle: fabricPainter.brush_globals.angle,
		strokeWidth: (fabricPainter.brush_globals.outline ? 0 : 2),
		stroke: (fabricPainter.brush_globals.outline ? fabricPainter.brush_globals.color : 'none'),
		fill: (fabricPainter.brush_globals.outline ? 'none' : fabricPainter.brush_globals.color),
		opacity: fabricPainter.brush_globals.opacity
	}));
	canvas.renderAll();
	return;
};

fabricPainter.addTriangle = function(data, angle, height, width, top, left) {
	canvas.add(new fabric.Triangle({
		width: width || fabricPainter.brush_globals.size,
		height: height || fabricPainter.brush_globals.size,
		left: left || data.e.layerX,
		top: top || data.e.layerY,
		hasControls: false,
		hasBorders: false,
		selectable: false,
		opacity: fabricPainter.brush_globals.opacity,
		strokeWidth: (fabricPainter.brush_globals.outline ? 0 : 2),
		stroke: (fabricPainter.brush_globals.outline ? fabricPainter.brush_globals.color : 'none'),
		fill: (fabricPainter.brush_globals.outline ? 'none' : fabricPainter.brush_globals.color)
	}));
	return;
};

fabricPainter.addLine = function(data, angle, height, top, left, width) {
	canvas.add(new fabric.Rect({
		width: width || 2,
		hasControls: false,
		hasBorders: false,
		selectable: false,
		height: height || Math.random() * fabricPainter.brush_globals.size,
		left: left || data.e.layerX || 100,
		top: top || data.e.layerY || 100,
		angle: angle || fabricPainter.brush_globals.angle,
		opacity: Math.random() * fabricPainter.brush_globals.opacity,
		fill: fabricPainter.brush_globals.color
	}));
	return;
};

fabricPainter.getRandomColor = function(color_type) {
	var r, g, b, o, color;
	r = Math.round(Math.random() * 255);
	g = Math.round(Math.random() * 255);
	b = Math.round(Math.random() * 255);
	o = Math.random() * 1;

	color = new fabric.Color('rgba('+r+', '+g+', '+b+', 1)');

	if(color_type === 'grayscale') {
		return color.toGrayscale().toHex();
	} else if(color_type === 'monotone') {
		return color.overlayWith('green').toHex();
	} else {
		return color.toHex();
	}
	return;
};

// ----------------------------------
// ADVANCED BRUSHES
// ----------------------------------

fabricPainter.drawTree = function(data, max_iterations){
	// draw circles that progressively decrease in size and step/repeat
	for(var i = 0; i <= max_iterations; i++) {
		fabricPainter.addCircle(data.e.layerY + (i * i), data.e.layerX, i);
	}
	return;
};

fabricPainter.drawInvertedTree = function(data, max_iterations){
	// draw circles that progressively increase in size and step/repeat
	for(var i = 0; i <= max_iterations; i++) {
		fabricPainter.addCircle(data.e.layerY + (i * (i + i)), data.e.layerX, max_iterations - i);
	}
	return;
};

fabricPainter.drawCopyCat = function(data) {
	fabricPainter.addCircle(data.e.layerY, data.e.layerX, fabricPainter.brush_globals.size);

	// draw mirrored but smaller copies of original
	var size = fabricPainter.brush_globals.size + 40;
	fabricPainter.addCircle(data.e.layerY - size, data.e.layerX - size, fabricPainter.brush_globals.size/3);
	fabricPainter.addCircle(data.e.layerY + size, data.e.layerX + size, fabricPainter.brush_globals.size/3);
	return;
};

fabricPainter.drawEerieFollower = function(data, timeout) {
	// draw pattern, then copy with a 1000ms delay to offset the generations
	fabricPainter.addCircle(data.e.layerY, data.e.layerX, fabricPainter.brush_globals.size);
	setTimeout(function(){
		fabricPainter.addCircle(data.e.layerY+100, data.e.layerX, fabricPainter.brush_globals.size/3);
	}, (timeout > 1000 ? timeout: 1000));
	return;
};

fabricPainter.drawGraffiti = function(data) {
	// draw a circle, then draw a line below it
	// to emulate dripping effect
	var height = canvas.height/2,
	bar_height = Math.random() * height,
	max_bar_width = 10,
	radius = fabricPainter.brush_globals.size;

	fabricPainter.addCircle(data.e.layerY, data.e.layerX, fabricPainter.brush_globals.size);
	if(Math.random() * 15 < 5) {

		// randomize placement of second "drip"
		fabricPainter.addLine(data, 0, bar_height, data.e.layerY + (bar_height / 2), data.e.layerX, Math.random() * max_bar_width);
	}
	return;
};

fabricPainter.makeRandomShapeArrangment = function(size, shape, color_type) {
	// randomize a shape in a clustered area,
	// with different colors
	for(var i = 1; i <= 10; i++) {
		var color = fabricPainter.getRandomColor(color_type);
		canvas.add(new fabric.Circle({
			top: (Math.random()*canvas.height/2) + 40,
			left: (Math.random()*canvas.width/2) + 40,
			hasControls: false,
			hasBorders: false,
			selectable: false,
			fill: color,
			radius: Math.random()*size,
			opacity: 1
		}));
	}
	canvas.renderAll();
	return;
};

fabricPainter.makeShapeClump = function(shape, max_iterations) {
	// create a dense clump of shapes - does not
	// defer to internal shape creation
	// methods, instead allows
	// for more customization - more 'freeform'
	var w = shape.get('width'),
	h = shape.get('height'),
	top = shape.get('top'),
	left = shape.get('left');
	for(var i = 1; i <= max_iterations; i++) {
		canvas.add(new fabric.Circle({
			top: (top - (h / 2) - 50) - h * Math.random() + 200,
			hasControls: false,
			hasBorders: false,
			selectable: false,
			left: left - w * Math.random() + 200,
			fill: fabricPainter.getRandomColor('monotone'),
			radius: Math.random() * ((max_iterations + 30)/2),
			opacity: Math.random() * fabricPainter.brush_globals.opacity
		}));
	}
	canvas.renderAll();
	return;
};

fabricPainter.addRandomTriangle = function(data) {
	fabricPainter.addTriangle(data, Math.random() * 360, Math.random() * fabricPainter.brush_globals.size, Math.random() * fabricPainter.brush_globals.size, null, null);
	return;
};

fabricPainter.addLineSwirls = function(data) {
	// add N lines in a radial pattern
	for(var i = 1; i <= Math.random()*10; i++) {
		fabricPainter.addLine(data, Math.random() * 360/i, null, null, null, null);
	}
	return;
};

fabricPainter.drawDnaBrush = function(data) {
	// draw vertical bars reminiscent of DNA markers
	for(var i = 1; i <= Math.random()*5; i++) {
		fabricPainter.addLineSwirls(data, 1, fabricPainter.brush_globals.size, null, null, null);
	}
	return;
};

fabricPainter.addRandomRect = function(data, angle) {
	fabricPainter.addSquare(data, data.e.layerY, data.e.layerX, angle, Math.random() * fabricPainter.brush_globals.size, Math.random() * fabricPainter.brush_globals.size);
	return;
};

fabricPainter.drawBubblesSimple = function(data) {
	for(var i = 0; i <= 2; i++) {
		fabricPainter.addCircle(data.e.layerY + Math.random(), data.e.layerX + Math.random(), fabricPainter.brush_globals.size);
	}
	return;
};

fabricPainter.drawBubblesComplex = function(data) {
	painter.makeShapeClump(new fabric.Rect({
		width: Math.random() * painter.brush_globals.size,
		height: Math.random() * painter.brush_globals.size,
		top: data.e.layerY,
		left: data.e.layerX,
		opacity: painter.brush_globals.opacity,
		fill: painter.brush_globals.color
	}), 4);
	return;
};

fabricPainter.drawEchoes = function(data) {
	// draw a cluster of circles reminiscent of bubbles
	for(var i = 0; i <= 5; i++) {
		fabricPainter.addCircle(data.e.layerY + (i * i * i), data.e.layerX + (i * i * i), fabricPainter.brush_globals.size);
	}
	return;
};

fabricPainter.drawGlassStorm = function(data) {
	var path = new fabric.Path('M 0 0 L ' + fabricPainter.rnd(100) + ' ' + fabricPainter.rnd(200) + ' L ' + fabricPainter.rnd(20) + ' ' + fabricPainter.rnd(100) + ' z');
	path.set({
		fill: (fabricPainter.brush_globals.outline ? 'none' : fabricPainter.brush_globals.color),
		strokeWidth: (fabricPainter.brush_globals.outline ? 0 : 2),
		selectable: false,
		stroke: (fabricPainter.brush_globals.outline ? fabricPainter.brush_globals.color : 'none'),
		opacity: fabricPainter.brush_globals.opacity,
		top: data.e.layerY,
		left: data.e.layerX
	});
	canvas.add(path);
	return;
};

fabricPainter.drawSporadicLines = function(data) {
	if(fabricPainter.paint_settings.points.length < fabricPainter.paint_settings.max_trace_factor) {
		fabricPainter.paint_settings.points.push({
			x: data.e.layerX,
			y: data.e.layerY
		});

		// do da magic
		for(var i = 0, len = fabricPainter.paint_settings.points.length; i < len; i++) {
			var width = Math.random() * 10,
			height = fabricPainter.paint_settings.points[i].x - fabricPainter.paint_settings.points[i+1].x,
			top = fabricPainter.paint_settings.points[i].y,
			left = fabricPainter.paint_settings.points[i].x,
			angle = fabricPainter.paint_settings.points[i].x - fabricPainter.paint_settings.points[i+1].x;
			fabricPainter.addSquare(data, top, left, angle, height, width);
		}
	} else {
		// empty array
		fabricPainter.paint_settings.points = [];
	}
	return;
};

fabricPainter.drawDiamondCross = function(data) {
	// draw a diamond that push out
	// from x/y axis based on original point
	var f = Math.random() * canvas.width / 2;
	fabricPainter.addSquare(data, data.e.layerY, Math.random() * f, 45, f/4, f/4);
	fabricPainter.addSquare(data, Math.random() * f, data.e.layerX, 45, f/4, f/4);
	return;
};

fabricPainter.drawStarLine = function(data) {
	// draw a line in a radial
	// pattern reminiscent of a star
	for(var i = 0; i <= 5; i++) {
		fabricPainter.addLine(data, Math.random()*360, canvas.height/2, null, null, null);
	}
	return;
};
