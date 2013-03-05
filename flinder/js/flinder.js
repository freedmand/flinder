var l_paper, r_paper, l_circle, r_circle, l_arrow, r_arrow, old_arrow_bb;
var RESIZE_BOUND = 1300;
var MIN_CIRCLE_SIZE = 63;
var MAX_CIRCLE_SIZE = 100;
var MIN_OPACITY = 0.2;
var MAX_OPACITY = 0.8;
var MAX_HOVER_OPACITY = 0.9;
var ANIMATION_LENGTH = 1000;

var CIRCLE_ATTRS = {'stroke-width': 3, 'cursor': 'pointer'};
var ARROW_ATTRS = {stroke: "none", 'stroke-width': 0, 'cursor': 'pointer'};
var CIRCLE_ANIM_ATTRS = {fill: "#93c0d0", stroke: '#f2f7f8', 'fill-opacity': MAX_OPACITY};
var ARROW_ANIM_ATTRS = {fill: "#f1f6f7"};

var CIRCLE_DISABLED_ATTRS = {'stroke-width': 3, 'cursor': 'auto'};
var ARROW_DISABLED_ATTRS = {stroke: 'none', 'stroke-width': 0, 'cursor': 'auto'};
var CIRCLE_DISABLED_ANIM_ATTRS = {fill: "#616161", stroke: '#f2f7f8', 'fill-opacity': MAX_OPACITY};
var ARROW_DISABLED_ANIM_ATTRS = {fill: "#bbbdc7"};

var ARROW_PATH = 'M5.5,15.499,15.8,21.447,15.8,15.846,25.5,21.447,25.5,9.552,15.8,15.152,15.8,9.552z';

var INTRO_MODE = 0;
var PROFILE_MODE = 1;
var NUM_PROFILES = 300;

var mode;

var current_profile;
var current_img;
var imgs;
var l_disabled = true;
var r_disabled = false;

var last_animation_event = -1;

var profile_data;

function resizeCircle(left, c_r, opacity)
{
	return resizeCircle(left, c_r, opacity, false);
}

function resizeCircle(left, c_r, opacity, animate)
{
	var c_x = left ? 0 : l_paper.width;
	var c_y = ($('.main').outerHeight() + $('.body-header').outerHeight()) / 2;
	
	var circle, arrow;
	if (left)
	{
		circle = l_circle;
		arrow = l_arrow;
	}
	else
	{
		circle = r_circle;
		arrow = r_arrow;
	}
	circle.data('c_r', c_r);
	circle.data('opacity', opacity);
	
	var arrow_size = 2 * (c_r - circle.attr('stroke-width')) / Math.sqrt(5);
	
	var scale = Math.min(arrow_size / old_arrow_bb.width, arrow_size / old_arrow_bb.height);
	
	if (animate)
	{
		circle.animate({'transform': ['T', c_x, c_y, 'S', c_r, c_r], 'opacity': opacity, 'fill-opacity': opacity}, ANIMATION_LENGTH);
		arrow.animate({'transform': ['T', (left ? arrow_size / 2 - old_arrow_bb.width : l_paper.width - arrow_size / 2 - old_arrow_bb.width), c_y - old_arrow_bb.height,'S', (left ? 1 : -1) * scale * 0.75, scale]}, ANIMATION_LENGTH);
	}
	else
	{
		circle.attr('transform', ['T', c_x, c_y, 'S', c_r, c_r]);
		circle.attr({'opacity': opacity, 'fill-opacity': opacity});
		arrow.attr('transform', ['T', (left ? arrow_size / 2 - old_arrow_bb.width : l_paper.width - arrow_size / 2 - old_arrow_bb.width), c_y - old_arrow_bb.height,'S', (left ? 1 : -1) * scale * 0.75, scale]);
	}
}

function resizeScale(x, max_x, min_size, max_size)
{
	if (x < 0)
		return min_size;
	if (x > max_x)
		return max_size;
	return (x / max_x) * (max_size - min_size) + min_size;
}

function changePic(left, time)
{
	last_animation_event = new Date().getTime();
	var prev_img = imgs[current_img];
	if (left)
		if (current_img == 0)
			return
		else
			current_img--;
	else
		if (current_img >= imgs.length - 1)
			return;
		else
			current_img++;
	var next_img = imgs[current_img];
	prev_img.stop(false, true);
	next_img.stop(false, true);
	if (left)
	{
		next_img.css({left:'-' + next_img.width() + 'px', 'z-index': 2, visibility: 'visible'});
		prev_img.css({'z-index': 1});
		prev_img.animate({left:'' + prev_img.width() + 'px'}, time, function () {prev_img.css({'visibility': 'hidden'}); });
		next_img.animate({left:'0px'}, time);
	}
	else
	{
		next_img.css({left:'' + next_img.width() + 'px', 'z-index': 2, visibility: 'visible'});
		prev_img.css({'z-index': 1});
		prev_img.animate({left:'-' + prev_img.width() + 'px'}, time, function () {prev_img.css({'visibility': 'hidden'}); });
		next_img.animate({left:'0px'}, time);
	}
	
	var content;
	if (mode == INTRO_MODE)
		content = slides[current_img];
	else
		content = parseProfile(current_img);
	$('#content').fadeOut(time / 2, function () {$('#content').html(content); $('#content').fadeIn(time / 2); });
	setAttrs(false, left);
}

function changePicFromTo(left, from, to, time)
{
	last_animation_event = new Date().getTime();
	var prev_img = imgs[from];
	var next_img = imgs[to];
	if (prev_img)
		prev_img.stop(false, true);
	if (next_img)
		next_img.stop(false, true);
	if (from != to)
	{
		if (left)
		{
			next_img.css({left:'-' + next_img.width() + 'px', 'z-index': 2, visibility: 'visible'});
			prev_img.css({'z-index': 1});
			prev_img.animate({left:'' + prev_img.width() + 'px'}, time, function () {prev_img.css({'visibility': 'hidden'}); });
			next_img.animate({left:'0px'}, time);
		}
		else
		{
			next_img.css({left:'' + next_img.width() + 'px', 'z-index': 2, visibility: 'visible'});
			prev_img.css({'z-index': 1});
			prev_img.animate({left:'-' + prev_img.width() + 'px'}, time, function () {prev_img.css({'visibility': 'hidden'}); });
			next_img.animate({left:'0px'}, time);
		}
	}
	current_img = to;
	var content;
	if (mode == INTRO_MODE)
		content = slides[current_img];
	else
	{
		content = parseProfile(current_img);
		if (to == 3)
			content += tooltips;
	}
	$('#content').fadeOut(time / 2, function () {$('#content').html(content); $('#content').fadeIn(time / 2); });
	setAttrs(false, left);
}

function setAttrs(first, left)
{
	if (current_img == 0)
	{
		if (!first)
		{
			l_circle.animate(CIRCLE_DISABLED_ANIM_ATTRS, ANIMATION_LENGTH);
			l_arrow.animate(ARROW_DISABLED_ANIM_ATTRS, ANIMATION_LENGTH);
			l_circle.attr(CIRCLE_DISABLED_ATTRS);
			l_arrow.attr(ARROW_DISABLED_ATTRS);
		}
		else
		{
			l_circle.attr(jQuery.extend(CIRCLE_DISABLED_ATTRS, CIRCLE_DISABLED_ANIM_ATTRS));
			l_arrow.attr(jQuery.extend(ARROW_DISABLED_ATTRS, ARROW_DISABLED_ANIM_ATTRS));
		}
		l_circle.data('enabled', false);
		resizeCircle(true, MIN_CIRCLE_SIZE, MAX_OPACITY, !first);
	}
	else
	{
		if (!first)
		{
			l_circle.animate(CIRCLE_ATTRS, ANIMATION_LENGTH);
			l_arrow.animate(ARROW_ATTRS, ANIMATION_LENGTH);
			l_circle.attr(CIRCLE_ATTRS);
			l_arrow.attr(ARROW_ATTRS);
		}
		else
		{
			l_circle.attr(jQuery.extend(CIRCLE_ATTRS, CIRCLE_ANIM_ATTRS));
			l_arrow.attr(jQuery.extend(ARROW_ATTRS, ARROW_ANIM_ATTRS));
		}
		l_circle.data('enabled', true);
		if (first || !left)
			resizeCircle(true, MIN_CIRCLE_SIZE, MIN_OPACITY, !first);
	}
	
	if (current_img == imgs.length - 1)
	{
		if (!first)
		{
			r_circle.animate(CIRCLE_DISABLED_ANIM_ATTRS, ANIMATION_LENGTH);
			r_arrow.animate(ARROW_DISABLED_ANIM_ATTRS, ANIMATION_LENGTH);
			r_circle.attr(CIRCLE_DISABLED_ATTRS);
			r_arrow.attr(ARROW_DISABLED_ATTRS);
		}
		else
		{
			r_circle.attr(jQuery.extend(CIRCLE_DISABLED_ATTRS, CIRCLE_DISABLED_ANIM_ATTRS));
			r_arrow.attr(jQuery.extend(ARROW_DISABLED_ATTRS, ARROW_DISABLED_ANIM_ATTRS));
		}
		r_circle.data('enabled', false);
		resizeCircle(false, MIN_CIRCLE_SIZE, MAX_OPACITY, !first);
	}
	else
	{
		if (!first)
		{
			r_circle.animate(CIRCLE_ATTRS, ANIMATION_LENGTH);
			r_arrow.animate(ARROW_ATTRS, ANIMATION_LENGTH);
			r_circle.attr(CIRCLE_ATTRS);
			r_arrow.attr(ARROW_ATTRS);
		}
		else
		{
			r_circle.attr(jQuery.extend(CIRCLE_ATTRS, CIRCLE_ANIM_ATTRS));
			r_arrow.attr(jQuery.extend(ARROW_ATTRS, ARROW_ANIM_ATTRS));
		}
		r_circle.data('enabled', true);
		if (first || left)
			resizeCircle(false, MIN_CIRCLE_SIZE, MIN_OPACITY, !first);
	}
}

function swapSub(self)
{
	console.log('swapping');
	var temp = $('.main-img').attr('src');
	$('.main-img').attr('src', $(self).attr('src'));
	$(self).attr('src', temp);
}

function parseProfile(i)
{
	var profile = profile_data[i];
	var images = $.map(profile.images, getCroppedProfile);
	var name = profile.name;
	var age = /[0-9]*/.exec(profile.geography[0]);
	var location = /[a-zA-Z0-9 ]*/.exec(profile.geography[1]);
	var essay = profile.essay;
	return generateProfilePage(name, location, age, essay, images[0], images[1], images[2], images[3], images[4]);
}

function switchToIntro()
{
	mode = INTRO_MODE;
	
	imgs = $.map($('#photo_holder_holder').children(), function (i) {return $(i)});
	
	changePicFromTo(true, current_img % 3, 0, ANIMATION_LENGTH);
}

function switchToProfiles()
{
	mode = PROFILE_MODE;
	
	var new_imgs = new Array(NUM_PROFILES);
	for (var i = 0; i < NUM_PROFILES; i++)
		new_imgs[i] = imgs[i % imgs.length];
	
	imgs = new_imgs;
	
	changePicFromTo(false, current_img + 3, 3, ANIMATION_LENGTH);
}

function generateProfilePage(name, location, age, blurb, img, subimg1, subimg2, subimg3, subimg4)
{
	return '<table><tbody><tr><td><table style="height: 286px;"><tbody><tr><td style="vertical-align: top;"><img class="rounded-img main-img" src="' + img + '"></td></tr><tr><td><table style="margin-left: auto; margin-right: auto;"><tbody><tr><td><img class="rounded-img sub-img" src="' + subimg1 + '" onclick="swapSub(this);"></td><td><img class="rounded-img sub-img" src="' + subimg2 + '" onclick="swapSub(this);"></td></tr><tr><td><img class="rounded-img sub-img" src="' + subimg3 + '" onclick="swapSub(this);"></td><td><img class="rounded-img sub-img" src="' + subimg4 + '" onclick="swapSub(this);"></td></tr></tbody></table></td></tr></tbody></table></td><td><table style="height: 286px;margin-left: 10px;"><tbody style="vertical-align: top;"><tr><td class="fine name-text" style="width: 427px;"><a href="mailto:' + 'ugly' + name.toLowerCase()+'_'+location[0].toLowerCase().replace(' ','') + '@shivermeflinders.com" style="color: #496d7c;">' + name + '</a><p class="fine location-text" style="width: 427px;">' + location + ', ' + age + '</p></td></tr><tr style="height: 100%; overflow:scroll;"><td class="fine blurb-text" style="width: 427px;"><div style="height: 200px; overflow: scroll;">' + blurb + '</div></td></tr></tbody></table></td></tr></tbody></table>';
}

function getCroppedProfile(url)
{
	return 'img/cropped_profiles/' + /[0-9A-Za-z]*\.jp/.exec(url) + 'g';
}

window.onload = function()
{
	mode = INTRO_MODE;
	imgs = $.map($('#photo_holder_holder').children(), function (i) {return $(i)});
	
	$('#content').html(slides[0]);
	
	$.getJSON("python/match_data.json", function(data) {
		profile_data = data;
	});
	
	current_img = 0;
	
	var width = MAX_CIRCLE_SIZE + CIRCLE_ATTRS['stroke-width'];
	var height = $('.main').outerHeight();
	
	l_paper = Raphael('raphael_left', width, height);
	r_paper = Raphael('raphael_right', width, height);
	
	l_circle = l_paper.circle(0, 0, 1);
	r_circle = r_paper.circle(0, 0, 1);
	l_circle.data('left', true);
	r_circle.data('right', false);
	
	l_arrow = l_paper.path(ARROW_PATH);
	r_arrow = r_paper.path(ARROW_PATH);
	
	old_arrow_bb = l_arrow.getBBox();	
	
	var hoverOut = function() {
		this.data('hovered', false);
		if (this.data('enabled'))
			resizeCircle(this.data('left'), this.data('c_r'), this.data('opacity'));
	}
	var hoverIn = function() {
		this.data('hovered', true);
		if (this.data('enabled'))
			this.attr({'opacity': MAX_HOVER_OPACITY, 'fill-opacity': MAX_HOVER_OPACITY});
	}
	var clickLeft = function()
	{
		if (mode == PROFILE_MODE)
			switchToIntro();
		else
			changePic(true, ANIMATION_LENGTH);
	}
	var clickRight = function()
	{
		changePic(false, ANIMATION_LENGTH);
	}
	
	l_circle.hover(hoverIn, hoverOut, l_circle, l_circle);
	r_circle.hover(hoverIn, hoverOut, r_circle, r_circle);
	l_arrow.hover(hoverIn, hoverOut, l_circle, l_circle);
	r_arrow.hover(hoverIn, hoverOut, r_circle, r_circle);
	l_circle.click(clickLeft);
	r_circle.click(clickRight);
	l_arrow.click(clickLeft);
	r_arrow.click(clickRight);
	
	setAttrs(true, false);
	
	$(document).mousemove(function(e){
		var left_prox = e.pageX - $('.main').offset().left;
		var right_prox = $('.main').outerWidth() - left_prox;
		var top_prox = e.pageY - $('.body-header').offset().top - $('.body-header').outerHeight();
		var bottom_prox = $('.main').offset().top + $('.main').outerHeight() - top_prox - $('.body-header').outerHeight();
		
		var rsize_bound = $('.main').outerWidth() / 2;
		
		var animation_occurring = last_animation_event != -1 && new Date().getTime() - last_animation_event <= ANIMATION_LENGTH;
		
		if (!animation_occurring)
		{
			if (l_circle.data('enabled') && l_circle.getBBox().x2 < left_prox)
			{
				if (!l_circle.data('hovered'))
					resizeCircle(true, resizeScale(rsize_bound - left_prox, rsize_bound, MIN_CIRCLE_SIZE, MAX_CIRCLE_SIZE),
					                   resizeScale(rsize_bound - left_prox, rsize_bound, MIN_OPACITY, MAX_OPACITY));
				else
				{
					l_circle.attr({'opacity': MAX_HOVER_OPACITY, 'fill-opacity': MAX_HOVER_OPACITY});
					l_circle.data('c_r', resizeScale(rsize_bound - left_prox, rsize_bound, MIN_CIRCLE_SIZE, MAX_CIRCLE_SIZE));
					l_circle.data('opacity', resizeScale(rsize_bound - left_prox, rsize_bound, MIN_OPACITY, MAX_OPACITY));
				}
			}
		
			if (r_circle.data('enabled') && r_circle.getBBox().x < left_prox)
			{
				if (!r_circle.data('hovered'))
					resizeCircle(false, resizeScale(rsize_bound - right_prox, rsize_bound, MIN_CIRCLE_SIZE, MAX_CIRCLE_SIZE),
					                    resizeScale(rsize_bound - right_prox, rsize_bound, MIN_OPACITY, MAX_OPACITY));
				else
				{
					r_circle.attr({'opacity': MAX_HOVER_OPACITY, 'fill-opacity': MAX_HOVER_OPACITY});
					r_circle.data('c_r', resizeScale(rsize_bound - right_prox, rsize_bound, MIN_CIRCLE_SIZE, MAX_CIRCLE_SIZE));
					r_circle.data('opacity', resizeScale(rsize_bound - right_prox, rsize_bound, MIN_OPACITY, MAX_OPACITY));
				}
			}
		}
	});
}