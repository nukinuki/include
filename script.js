$(function(){
	var messages = {
		ru: {
			'EDIT': 'Редактировать',
			'SAVE': 'Сохранить',
			'CANCEL': 'Отменить',
			'CANT_SAVE': "Не могу сохранить файл",
			'FILENAME_NOT_DEFINED': 'Не указано имя файла',
			'CANT_WRITE_FILE': 'Не могу записать файл',
			'NO_ACCESS': 'Доступ запрещён'
		},
		en: {
			'EDIT': 'Edit',
			'SAVE': 'Save',
			'CANCEL': 'Cancel',
			'CANT_SAVE': "Error: Can't save the file",
			'FILENAME_NOT_DEFINED': 'Filename not difined',
			'CANT_WRITE_FILE': "Can't write the file",
			'NO_ACCESS': 'Forbidden'
		}
	}

	var langId = BX.message.LANGUAGE_ID;
	
	if(!messages.hasOwnProperty(langId)){
		langId = 'en';
	}

	function message(code){
		if(messages[langId].hasOwnProperty(code)){
			return messages[langId][code];
		}
		return code;
	}

	$('.webprofy-include').each(function(){
		var $context = $(this);
		var id = $context.attr('id');
		var ajaxPath = $context.attr('data-ajax');
		var fileName = $context.attr('data-file');

		var editorEnabled = false;
		var editorInited = false;

		// Так как плагин нужно инициализировать каждый раз, возвращаем опции через функцию
		var richOptions = function() {
			return {
				disableExtraSpaces: true,
				imageDragging: false,
				extensions: {
				    imageDragging: {},
				    imageDraggingCustom: new MediumEditor.extensions.imageDraggingCustom()
				},
				toolbar: {
					buttons: ['bold', 'italic', 'anchor', 'h2', 'h3', 'quote']
				}
			}
		};

		var imgOptions = function() {
			return {
				disableReturn: true,
				disableExtraSpaces: true,
				imageDragging: false,
				extensions: {
				    imageDragging: {},
				    imageDraggingCustom: new MediumEditor.extensions.imageDraggingCustom()
				},
				toolbar: false
			}
		}

		var options = function() {
			return {
				disableReturn: true,
				disableExtraSpaces: true,
				imageDragging: false,
				extensions: {
				    imageDragging: {}
				},
				toolbar: {
					buttons: ['bold', 'italic', 'anchor']
				}
			}
		};

		var editors = [];

		//var editor;

		var richEditor;

		$context.wrapInner('<div class="webprofy-include__editable"></div>');
		
		var $editable = $('.webprofy-include__editable', $context);

		// Если нет ни одного размеченного тега, считаем всю область редактируемой
		if($('[data-editable]', $context).length == 0){
			$editable.attr({'data-editable': '', 'data-rich': ''});
		}

		var $buttons = $('<div class="webprofy-include__buttons"></div>');
		var $edit = $('<a class="webprofy-include__edit">' + message('EDIT') + '</a>').appendTo($buttons);
		var $cancel = $('<a class="webprofy-include__cancel">' + message('CANCEL') + '</a>').appendTo($buttons);
		var $save = $('<a class="webprofy-include__save">' + message('SAVE') + '</a>').appendTo($buttons);
		
		$context.append($buttons);

		var $savedHtml = '';

		function enableEditor(){
			if(editorEnabled){
				return;
			}
			$('[data-editable]', $context).each(function(){
				if($(this).is('img')){
					var editor = new MediumEditor($(this), imgOptions());
				} else if ($(this).is['data-img']){
					var editor = new MediumEditor($(this), imgOptions());
				} else if($(this).is('[data-rich]')){
					var editor = new MediumEditor($(this), richOptions());
				} else {
					var editor = new MediumEditor($(this), options());
				}
				editors.push(editor);
			});

			editorEnabled = true;
			editorInited = true;
			window['editors' + id] = editors;
			updateState();
		}

		function disableEditor(){
			if(!editorEnabled){
				return;
			}
			editors.map(function(editor) { return editor.destroy(); });
			editors = [];
			window['editors' + id] = editors;

			editorEnabled = false;
			updateState();
		}

		function updateState(){
			if(editorEnabled){
				$edit.hide();
				$cancel.show();
				$save.show();
			} else {
				$edit.show();
				$cancel.hide();
				$save.hide();
			}
		}

		function stopInteraction(){
			$context.addClass('is-disabled');
		}

		function startInteraction(){
			$context.removeClass('is-disabled');
		}

		function stripEmptyClassTags(){
			$('[class=""]', $editable).removeAttr('class');
		}

		function saveFile(html, callback){
			console.log({data: {
					'html': html,
					'file': fileName
				}});
			$.ajax({
				type: "POST",
				url: ajaxPath,
				data: {
					'html': html,
					'file': fileName
				},
				success: function(data){
					if(callback){
						callback();
					}
				},
				error: function(e){
					console.log(e);
					alert(message('CANT_SAVE'));
					if(callback){
						callback();
					}
				},
			});
		}

		$edit.on('click', function(){
			savedHtml = $editable.html();
			enableEditor();
		});
		$cancel.on('click', function(){
			disableEditor();
			$editable.html(savedHtml);
			editorInited = false;
		});
		$save.on('click', function(){
			disableEditor();
			stripEmptyClassTags();
			var html = $editable.html();
			stopInteraction();
			saveFile(html, startInteraction);
		});

		// Перехватываем двойной клик, чтобы он не ушёл в битрикс
		$editable.on('dblclick', function(e){
			if(editorEnabled){
				e.stopPropagation();
			}
		});

		updateState();
	});
});