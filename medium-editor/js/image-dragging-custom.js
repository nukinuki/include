(function () {
    'use strict';

    var ImageDragging = MediumEditor.Extension.extend({
        init: function () {
            MediumEditor.Extension.prototype.init.apply(this, arguments);

            this.subscribe('editableDrag', this.handleDrag.bind(this));
            this.subscribe('editableDrop', this.handleDrop.bind(this));
        },

        handleDrag: function (event) {
            var className = 'medium-editor-dragover';
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';

            if (event.type === 'dragover') {
                event.target.classList.add(className);
            } else if (event.type === 'dragleave') {
                event.target.classList.remove(className);
            }
        },

        handleDrop: function (event) {
            var className = 'medium-editor-dragover',
                files;
            event.preventDefault();
            event.stopPropagation();

            // IE9 does not support the File API, so prevent file from opening in a new window
            // but also don't try to actually get the file
            if (event.dataTransfer.files) {
                files = Array.prototype.slice.call(event.dataTransfer.files, 0);
                files.some(function (file) {
                    if (file.type.match('image')) {
                        var fileReader, id;
                        fileReader = new FileReader();
                        fileReader.readAsDataURL(file);

                        var img;
                        var removeClassAndId = true;

                        if(event.target.tagName == 'IMG'){
                            img = event.target;
                            removeClassAndId = false;
                        } else {

                            this.base.selectElement(event.target);
                            var selection = this.base.exportSelection();
                            selection.start = selection.end;
                            this.base.importSelection(selection);

                            id = 'medium-img-' + (+new Date());
                            MediumEditor.util.insertHTMLCommand(this.document, '<img class="medium-editor-image-loading" id="' + id + '" />');
                            img = this.document.getElementById(id);
                        }

                        fileReader.onload = function () {
                            if (img) {
                                img.src = fileReader.result;
                                if(removeClassAndId){
                                    img.removeAttribute('id');
                                    img.removeAttribute('class');
                                }
                            }
                        }.bind(this);
                    }
                }.bind(this));
            }
            event.target.classList.remove(className);
        }
    });

    MediumEditor.extensions.imageDraggingCustom = ImageDragging;
}());