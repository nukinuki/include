<?
use \Bitrix\Main\Loader;
use \Bitrix\Main\Localization\Loc;
use \Bitrix\Main\Page\Asset;

if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();

Loc::loadMessages(__FILE__);

class WebprofyInclude extends CBitrixComponent
{
	const IMAGE_SAVE_FOLDER = "/upload/webprofy_include/";

	public static function saveFile($fileName, $html){
		global $APPLICATION;

		if(!$fileName){
			return array('error' => 'FILENAME_NOT_DEFINED', 'error_code' => 400);
		}

		if($APPLICATION->GetFileAccessPermission($fileName) < "W"){
			return array('error' => 'NO_ACCESS', 'error_code' => 403);
		}

		$html = self::saveImages($html, $fileName);
		$res = file_put_contents($_SERVER['DOCUMENT_ROOT'].$fileName, $html);
		if($res === false){
			return array('error' => 'CANT_WRITE_FILE', 'error_code' => 500);
		}
		return array('success' => true);
	}

	public static function saveImages($html, $fileName){

		// Создаём папку для изображений, если не существует
		if (!file_exists($_SERVER['DOCUMENT_ROOT'].self::IMAGE_SAVE_FOLDER)) {
			mkdir($_SERVER['DOCUMENT_ROOT'].self::IMAGE_SAVE_FOLDER);
		}

		$extensions = array(
			"jpeg" => "jpg",
			"gif" => "gif",
			"png" => "png",
			"svg+xml" => "svg",
			"svg" => "svg"
		);

		$regexp1 = '%src=["\'](.*?)["\']%';
		$regexp2 = '%src=["\']data:image/('.implode("|", array_keys($extensions)).');base64,(.*?)["\']%';

		return preg_replace_callback($regexp1, function($matches) use ($fileName, $extensions, $regexp2) {
			static $index = 1;

			$parts = [];

			if(preg_match($regexp2, $matches[0], $parts)){
				// Собираем название файла из названия включаемой области и порядкового номера вхождения картинки и таймштампа
				$output_file = self::IMAGE_SAVE_FOLDER.basename($fileName, ".php")."-".$index."-".time().".".$extensions[$parts[1]];
				$index++;

				$server_output_file = $_SERVER['DOCUMENT_ROOT'].$output_file;

				// Сохраняем файл
			    $ifp = fopen($server_output_file, 'wb'); 
			    fwrite($ifp, base64_decode($parts[2]));
			    fclose($ifp);
			    return 'src="'.$output_file.'"';
			} else {
				// Эта обычная картинка по ссылке, учитываем её при формировании нумерации
				$index++;
				return $matches[0];
			}
		}, $html);
	}

	public function executeComponent()
	{
		global $APPLICATION;
		$isEditor = $APPLICATION->GetShowIncludeAreas() && $APPLICATION->GetFileAccessPermission($this->arParams['FILE']) >= "W";
		$id = $this->randString();
		$ajaxPath = $this->__path."/ajax.php";
		$fileName = $this->arParams['FILE'];

		if($isEditor){
			echo "<div id='${id}' class='webprofy-include' data-ajax='${ajaxPath}' data-file='${fileName}'>";

			Asset::getInstance()->addCss($this->__path."/medium-editor/css/medium-editor.css");
			Asset::getInstance()->addCss($this->__path."/medium-editor/css/themes/beagle.css");
			Asset::getInstance()->addCss($this->__path."/_style.css");

			Asset::getInstance()->addJs($this->__path."/medium-editor/js/medium-editor.js");
			Asset::getInstance()->addJs($this->__path."/medium-editor/js/image-dragging-custom.js");
			Asset::getInstance()->addJs($this->__path."/_script.js");

			$editor = '&site='.SITE_ID.'&back_url='.urlencode($_SERVER['REQUEST_URI']).'&templateID='.urlencode(SITE_TEMPLATE_ID);

			$arIcons = array(
				array(
					"URL" => 'javascript:'.$APPLICATION->GetPopupLink(
						array(
							"URL" => "/bitrix/admin/public_file_edit_src.php?lang=".LANGUAGE_ID."&opener=webprofy.include&path=".urlencode($fileName).$editor,
							"PARAMS" => array(
								"width" => 770,
								"height" => 570,
								"resize" => true,
								"dialog_type" => 'EDITOR',
								"min_width" => 700,
								"min_height" => 400
							)
						)
					),
					"DEFAULT" => true,
					"ICON" => "bx-context-toolbar-edit-icon",
					"TITLE" => Loc::getMessage("WP_INCLUDE_EDIT_AS_PHP"),
				)
			);

			$this->AddIncludeAreaIcons($arIcons);
		}

		include($_SERVER['DOCUMENT_ROOT'].$fileName);

		if($isEditor){
			echo "</div>";
		}
	}
}