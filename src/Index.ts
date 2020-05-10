import * as ControlValidation from "./ControlValidation";
import { extensionManager } from "@docsvision/webclient/System/ExtensionManager";
import {ILocalizationsMap} from "@docsvision/webclient/System/ILocalizationsMap";

// Данный файл является входной точкой для сборки расширения.
// Он должен прямо или косвенно импортировать все другие файлы скриптов.

// Регистрируем расширение и все его обработчики
extensionManager.registerExtension({
    name: "ControlValidation",
    version: "5.5.14",
    globalEventHandlers: [ControlValidation],
    getLocalizations: getLocalizations
});

function getLocalizations(): ILocalizationsMap {
    let cultureMap = {};
    cultureMap["ru"] = {
        "AgreementList_Caption": "{1}",
        "AgreementList_CaptionNoNumber": "{0}"
    };
    cultureMap["en"] = {
        "AgreementList_Caption": "{1}",
        "AgreementList_CaptionNoNumber": "{0}"

    };
    return cultureMap;
}