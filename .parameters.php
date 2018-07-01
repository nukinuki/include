<? if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true) die();
use Bitrix\Main\Localization\Loc;
Loc::loadMessages(__FILE__);

$arComponentParameters = array(
	"GROUPS" => array(),
	"PARAMETERS" => array(
		"FILE" => array(
			"PARENT" => "DATA_SOURCE",
			"NAME" => Loc::getMessage("WP_INCLUDE_FILE"),
			"TYPE" => "FILE",
			"MULTIPLE" => "N",
		)
	)
);