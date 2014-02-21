$(function($)
{
	$.fn.imageViewer = function(parameters, tags) {

		/* Parameters */

		var defaultParameters = {
			'activateTagging': false,
			'image': null,
			'imageThumbnail': null,
			'tagMarkerStyle': 'position: absolute; height: 15px; width: 15px; margin-left: -7.5px; margin-top: -7.5px; color: white; cursor: pointer;',
			'onTagAdded': null,
			'onTagClicked': null,
			'onTagMoved': null
		};

		$(this).data('parameters', $.extend(defaultParameters, parameters));

		/* Check images */

		if($(this).data('parameters').image === null) {
			console.log('No image for imageViewer plugin');
			return null;
		}
		else {
			if($(this).data('parameters').imageThumbnail === null) {
				$(this).data('parameters').imageThumbnail = $(this).data('parameters').image;
			}
		}

		/* initialization */

		if($(this).data('parameters').activateTagging === true) {
			/* Initialize structure and logic */

			$(this).createImageTaggerStructureAndLogic();

			/* Initialize tags */

			$(this).initializeTags(tags);
		}
		else {
			/* Initialize structure and logic */

			$(this).createImageViewerStructureAndLogic();
		}

		/* Return */

		return this;
	};

	$.fn.createImageTaggerStructureAndLogic = function() {

		/* Structure */

		$(this).html('');

		/** Image tagger container **/

		var imageTaggerContainerStructure = '<div id="imageTaggerContainer"></div>';
		$(this).append(imageTaggerContainerStructure);
		$(this).data('imageTaggerContainer', $(this).children('#imageTaggerContainer'));

		/** Image viewer container **/

		var imageViewerContainerStructure = '<div id="imageViewerContainer"></div>';
		$(this).data('imageTaggerContainer').append(imageViewerContainerStructure);
		$(this).data('imageViewerContainer', $(this).data('imageTaggerContainer').children('#imageViewerContainer'));

		/** Image tag container **/

		var imageTagMarkersContainerStructure = '<div id="imageTagMarkersContainer"></div>';
		$(this).data('imageTaggerContainer').append(imageTagMarkersContainerStructure);
		$(this).data('imageTagMarkersContainer', $(this).data('imageTaggerContainer').children('#imageTagMarkersContainer'));

		/** Mode selector **/

		var modeSelectorStructure = '<select id="modeSelector">';
		modeSelectorStructure += '<option value="zoomMode">Zoom</option>';
		modeSelectorStructure += '<option value="tagMode">Tag</option>';
		modeSelectorStructure += '</select>';
		$(this).data('imageTaggerContainer').append(modeSelectorStructure);
		$(this).data('modeSelector', $(this).data('imageTaggerContainer').children('#modeSelector'));

		/** Image **/

		var imageStructure = '<img src="#imageThumbnail#" data-zoom-image="#image#" style="cursor: crosshair"/>';
		imageStructure = imageStructure.replace('#imageThumbnail#', $(this).data('parameters').imageThumbnail);
		imageStructure = imageStructure.replace('#image#', $(this).data('parameters').image);
		$(this).data('imageViewerContainer').append(imageStructure);
		$(this).data('image', $(this).data('imageViewerContainer').children('img'));

		/* Logic */

		/** Bind the mode selector **/

		$(this).initializeModeSelector();

		/** Initialize first mode **/

		$(this).activateImageZoom();
	};

	$.fn.createImageViewerStructureAndLogic = function() {

		/* Structure */

		$(this).html('');

		/** Image viewer container **/

		var imageViewerContainerStructure = '<div id="imageViewerContainer"></div>';
		$(this).append(imageViewerContainerStructure);
		$(this).data('imageViewerContainer', $(this).children('#imageViewerContainer'));

		/** Image **/

		var imageStructure = '<img src="#imageThumbnail#" data-zoom-image="#image#"/>';
		imageStructure = imageStructure.replace('#imageThumbnail#', $(this).data('parameters').imageThumbnail);
		imageStructure = imageStructure.replace('#image#', $(this).data('parameters').image);
		$(this).data('imageViewerContainer').append(imageStructure);
		$(this).data('image', $(this).data('imageViewerContainer').children('img'));

		/* Logic */

		/** Initialize zoom mode **/

		$(this).activateImageZoom();
	};

	$.fn.initializeModeSelector = function() {
		var realThis = $(this);

		$(this).data('modeSelector').change(function() {
			if($(this).val() === 'zoomMode') {
				realThis.desactivateImageTagging();
				realThis.activateImageZoom();
			}
			else if($(this).val() === 'tagMode') {
				realThis.desactivateImageZoom();
				realThis.activateImageTagging();
			}
		});
	};

	$.fn.activateImageZoom = function() {
		$(this).data('image').elevateZoom( {
			cursor: "crosshair",
			//zoomType: "inner",
			zoomWindowFadeIn: 250,
			zoomWindowFadeOut: 250,
			scrollZoom: true,
			scrollZoomIncrement: 0.05
		});
	};

	$.fn.desactivateImageZoom = function() {
		$(this).data('image').removeData('elevateZoom');
		$('.zoomContainer').remove();
	};

	$.fn.activateImageTagging = function() {
		var realThis = $(this);

		/* Create tag binding */

		$(this).data('image').bind('click', function(e) {
			var offset = $(this).offset();

			var positionX = e.clientX - offset.left;
			var positionY = e.clientY - offset.top;

			var currentWidth = $(this).width();
			var currentHeight = $(this).height();

			var ratioX = positionX / currentWidth;
			var ratioY = positionY / currentHeight;

			tagId = realThis.tagImage(ratioX, ratioY);

			/* Call back function */

			if(realThis.data('parameters').onTagAdded) {
				realThis.data('parameters').onTagAdded(realThis.getTag(tagId));
			}
		});

		/* Display tags */

		$(this).renderTags();
		$(this).data('tagMarkers').show();

		/* Activate tag drag and drop */

		$(this).inializeTagDragAndDrop();
		$(this).initializeClick();
	};

	$.fn.desactivateImageTagging = function() {
		/* Remove tag binding */

		$(this).data('image').unbind('click');

		/* Hide tags */

		$(this).data('tagMarkers').hide();
	};

	$.fn.tagImage = function (ratioX, ratioY) {
		/* Add tag */

		var tagId = $(this).getTagIdMax() + 1;

		$(this).data('tags').push( {
			'id': tagId,
			'ratioX': ratioX,
			'ratioY': ratioY
			}
		);

		$(this).renderTags();
		$(this).data('tagMarkers').show();

		return tagId;
	};

	$.fn.renderTags = function() {
		var currentWidth = $(this).data('image').width();
		var currentHeight = $(this).data('image').height();
		var offset = $(this).data('image').offset();

		/* Clean the tag markers containers */

		$(this).data('imageTagMarkersContainer').html('');

		/* Insert tag markers */

		var tagMarkerStructure = '<div id="#id#" class="tagMarker glyphicon glyphicon-map-marker #class#" style="#style#"></div>';
		tagMarkerStructure = tagMarkerStructure.replace('#style#', $(this).data('parameters').tagMarkerStyle);

		for(var i in $(this).data('tags')) {
			var tagMarkerStructureTemp = tagMarkerStructure.replace('#id#', 'tag' + $(this).data('tags')[i].id);

			if($(this).data('tags')[i].class) {
				tagMarkerStructureTemp = tagMarkerStructureTemp.replace('#class#', $(this).data('tags')[i].class);
			}
			else {
				tagMarkerStructureTemp = tagMarkerStructureTemp.replace(' #class#', '');
			}

			/* Insert the object */

			$(this).data('imageTagMarkersContainer').append(tagMarkerStructureTemp);

			/* Set his position */

			$('#tag' + $(this).data('tags')[i].id).css({
				'left': offset.left + $(this).data('tags')[i].ratioX * currentWidth,
				'top': offset.top + $(this).data('tags')[i].ratioY * currentHeight
			});
		}

		$(this).data('tagMarkers', $(this).data('imageTagMarkersContainer').children('.tagMarker'));

		/* Activate actions */

		$(this).inializeTagDragAndDrop();
		$(this).initializeClick();
	};

	$.fn.initializeClick = function() {
		var realThis = $(this);

		$(this).data('tagMarkers').bind('click', function() {
			var tagId = parseInt($(this).attr('id').substr(3));

			/* Call back function */

			if(realThis.data('parameters').onTagClicked) {
				realThis.data('parameters').onTagClicked(realThis.getTag(tagId));
			}
		});
	};

	$.fn.inializeTagDragAndDrop = function() {
		var realThis = $(this);

		$(this).data('tagMarkers').draggable({
			opacity: 0.50,
			stop: function() {
				var offset = realThis.data('image').offset();

				var positionX = $(this).position().left - offset.left;
				var positionY = $(this).position().top - offset.top;

				var currentWidth = realThis.data('image').width();
				var currentHeight = realThis.data('image').height();

				var ratioX = Math.min(Math.max(0, positionX / currentWidth), 1);
				var ratioY = Math.min(Math.max(0, positionY / currentHeight), 1);

				var tagId = parseInt($(this).attr('id').substr(3));

				realThis.setTagPosition(tagId, ratioX, ratioY);

				realThis.renderTags();

				/* Call back function */

				if(realThis.data('parameters').onTagMoved) {
					realThis.data('parameters').onTagMoved(realThis.getTag(tagId));
				}
			}
		});
	};

	$.fn.initializeTags = function(tags) {
		$(this).data('tags', new Array());

		for(var i in tags) {
			$(this).data('tags').push( {
					'id': tags[i].id,
					'class': tags[i].class,
					'ratioX': tags[i].ratioX,
					'ratioY': tags[i].ratioY
				}
			);
		}
	};

	$.fn.getTagIdMax = function() {
		if($(this).data('tags').length !== 0) {
			var idMax = 0;

			for(var i in $(this).data('tags'))
				idMax = Math.max(idMax, $(this).data('tags')[i].id);

			return idMax;
		}
		else {
			return 0;
		}
	};

	$.fn.getTag = function(id) {
		for(var i in $(this).data('tags'))
			if($(this).data('tags')[i].id === id)
				return $(this).data('tags')[i];

		return null;
	};

	$.fn.setTagPosition = function(id, ratioX, ratioY) {
		var tag = $(this).getTag(id);

		tag.ratioX = ratioX;
		tag.ratioY = ratioY;
	};
});