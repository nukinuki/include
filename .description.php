<? if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true) die();
use Bitrix\Main\Localization\Loc;
Loc::loadMessages(__FILE__);

$arComponentDescription = array(
	"NAME" => Loc::getMessage("WP_INCLUDE_NAME"),
	"DESCRIPTION" => Loc::getMessage("WP_INCLUDE_DESCRIPTION"),
	"PATH" => array(
		"ID" => "webprofy",
		"NAME" => "WebProfy",
		"CHILD" => array(
			"ID" => "webprofy_include",
			"NAME" => "Текущая дата"
		)
	)
);
