<? include($_SERVER['DOCUMENT_ROOT'].'/bitrix/modules/main/include/prolog_before.php');

CBitrixComponent::includeComponentClass("webprofy:include");

$res = WebprofyInclude::saveFile($_POST['file'], $_POST['html']);

if($res['error_code']){
	header("HTTP/1.0 ".$res['error_code']);
}

echo json_encode($res);
exit(1);