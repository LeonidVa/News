import {MessageBox} from "@docsvision/webclient/Helpers/MessageBox/MessageBox";
import {TextBox, TextBoxParams} from "@docsvision/webclient/Platform/TextBox";
import {CancelableEventArgs} from "@docsvision/webclient/System/CancelableEventArgs";
import {Layout} from "@docsvision/webclient/System/Layout";
import {CardID} from "@docsvision/webclient/Platform/CardEditRouteTypeMapper";
import {layoutManager} from "@docsvision/webclient/System/LayoutManager";
import {NumberControl} from "@docsvision/webclient/Platform/Number";
import {Numerator, NumeratorParams} from "@docsvision/webclient/BackOffice/Numerator";
import {State, StateParams} from "@docsvision/webclient/BackOffice/State";
import {ICancelableEventArgs} from "@docsvision/webclient/System/ICancelableEventArgs";

import {$UrlResolver} from "@docsvision/webclient/System/$UrlResolver";
import {$RequestManager, IRequestManager} from "@docsvision/webclient/System/$RequestManager";
import {UrlResolver} from "@docsvision/webclient/System/UrlResolver";
import {TableParams} from "@docsvision/webclient/Platform/Table";
import {DateTimePicker} from "@docsvision/webclient/Platform/DateTimePicker";
import {Links, LinksParams} from "@docsvision/webclient/BackOffice/Links";
import {TextArea} from "@docsvision/webclient/Platform/TextArea";
import {DateFormats} from "@docsvision/webclient/System/DateFormats";
import {IDataChangedEventArgsEx} from "@docsvision/webclient/System/IDataChangedEventArgs";
import {GenModels} from "@docsvision/webclient/Generated/DocsVision.WebClient.Models";
import {Employee} from "@docsvision/webclient/BackOffice/Employee";
import DirectoryDataType = GenModels.DirectoryDataType;
import {DirectoryDesignerRow, DirectoryDesignerRowParams} from "@docsvision/webclient/BackOffice/DirectoryDesignerRow";
import {
    $CommentsController,
    $EmployeeController,
    GenControllers
} from "@docsvision/webclient/Generated/DocsVision.WebClient.Controllers";
import DirectoryDesignerRowController = GenControllers.DirectoryDesignerRowController;
import IDirectoryDesignerRowController = GenControllers.IDirectoryDesignerRowController;
import EmployeeController = GenControllers.EmployeeController;
import {CardLink} from "@docsvision/webclient/Platform/CardLink";
import {RadioGroup, RadioGroupParams} from "@docsvision/webclient/Platform/RadioGroup";
import {PartnerDepartment} from "@docsvision/webclient/BackOffice/PartnerDepartment";
import BindingMetadata = GenModels.BindingMetadata;
import {Block} from "@docsvision/webclient/Platform/Block";
import {CheckBox} from "@docsvision/webclient/Platform/CheckBox";
import {CardManagement} from "@docsvision/webclient/Platform/CardManagement";
import {CommentEditor} from "@docsvision/webclient/BackOffice/CommentEditor";
import Comment = GenModels.Comment;
import {Comments} from "@docsvision/webclient/BackOffice/Comments";
import {getCardCreateRoute} from "@docsvision/webclient/Platform/NewCardRouteHelpers";


import moment from 'moment'
import {$CurrentEmployee} from "@docsvision/webclient/StandardServices";
import {AgreementList, AgreementListParams} from "@docsvision/webclient/Approval/AgreementList";
import AgreementListModel = GenModels.AgreementListModel;
import {$CardId} from "@docsvision/webclient/System/LayoutServices";
import {ILayoutSavedEventArgs} from "@docsvision/webclient/System/ILayoutParams";
import {serviceName} from "@docsvision/webclient/System/ServiceUtils";
import {IAgreementListReportOpenedEventArgs} from "@docsvision/webclient/Approval/IAgreementListReportOpenedEventArgs";
import {AgreementListContent} from "@docsvision/webclient/Approval/AgreementListContent";
import {IAgreementListContentProps} from "@docsvision/webclient/Approval/IAgreementListContentProps";
import {IAgreementListContentState} from "@docsvision/webclient/Approval/IAgreementListContentState";
import {waitTimeout} from "@docsvision/webclient/System/WaitTimeout";
import {ILocalizationsMap} from "@docsvision/webclient/System/ILocalizationsMap";
import {$RouterNavigation} from "@docsvision/webclient/System/$Router";

export function validateTextBoxControl(layout: Layout) {

    let idofThisCard: TextBox = layout.controls.CardID;
    let cardId: string = layoutManager.cardLayout.cardInfo.id;


    idofThisCard.params.value = cardId;
    console.log('123')
}

let flagOpen = true;

export async function trueOrFalse() {
    flagOpen = true;
}

export async function changeDateOfModification(sender: Layout, args: ICancelableEventArgs<any>) {

    if (flagOpen) {

        flagOpen = false;
        args.wait();


        let dateChange = sender.layout.controls.dateOfChange;

        dateChange.params.value = new Date();
        dateChange.save();
        args.accept();
    }


}

export async function addTrueDidgest(layout: Layout) {
    let cardId = layout.cardInfo.id;
    let urlResolver = layout.getService($UrlResolver)
    let requestManager = layout.getService($RequestManager);
    let didgest = await createTrueDidgest(urlResolver, requestManager, cardId);

}

export async function createTrueDidgest(urlResolver: UrlResolver, requestManager: IRequestManager, cardId: string) {

    let url = urlResolver.resolveApiUrl("FillDigest", "DigestService");
    url += "?cardId=" + cardId;
    return requestManager.get(url)
}

export async function addFirstNumberToContractDocument(sender: Layout) {
    let documentKind = sender.layout.controls.DocKind;
    let numerator = sender.layout.controls.RegNum;

    if (documentKind.value.name == "Дополнительное соглашение") {

        numerator.allowManualEdit = true;
        numerator.forceUpdate();

    } else {

        await numerator.generateNewNumber();
    }
}

export async function addPartnerParametrs(sender: Layout) {
    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);
    let partner = sender.layout.controls.PartnerCompany;
    let partnerInn = sender.layout.controls.PartnerINN;
    let partnerOKPO = sender.layout.controls.PartnerOKPO;
    let PartnerAcc: TextBox = sender.layout.controls.PartnerAcc;
    let PartnerEmpl: TextBox = sender.layout.controls.PartnerEmpl;
    let PartnerAdress: TextBox = sender.layout.controls.PartnerAdress;
    let PartnerPerson: TextArea = sender.layout.controls.PartnerPerson;
    let buttonChangeParams = sender.layout.controls.changeParams;
    let accId = sender.layout.controls.accID;
    if (partner.value == null) {
        partnerInn.params.value = null;
        partnerOKPO.params.value = null;
        PartnerAcc.params.value = null;
        PartnerAdress.params.value = null;
        accId.params.value = null;
    } else {
        let partnerId = partner.params.value.id;
        let dataPartners = await getPartnerParameters(urlResolver, requestManager, partnerId)
        partnerInn.params.value = dataPartners['inn'];
        partnerOKPO.params.value = dataPartners['okpo'];
        PartnerAcc.params.value = dataPartners['accountInfo'];
        PartnerAdress.params.value = dataPartners['adress'];
        accId.params.value = dataPartners['accID'];

    }

    buttonChangeParams.params.visibility = true;

}

export async function getPartnerParameters(urlResolver: UrlResolver, requestManager: IRequestManager, partnerId: String) {
    let url = urlResolver.resolveApiUrl("GetPartnerInfo", "PartnerService");
    url += "?id=" + partnerId;
    return requestManager.get(url)
}

export async function addHoldingParameters(sender: Layout) {
    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);
    let HoldingUnit = sender.layout.controls.HoldingUnit;

    let HoldingINN = sender.layout.controls.HoldingINN;
    let HoldingSigner: TextBox = sender.layout.controls.HoldingSigner;
    let HoldingOKPO = sender.layout.controls.HoldingOKPO;
    let HoldingAdress: TextBox = sender.layout.controls.HoldingAdress;
    let HoldingAcc: TextBox = sender.layout.controls.HoldingAcc;
    console.log(HoldingUnit);
    if (HoldingUnit.value == null) {
        HoldingINN.params.value = null;
        HoldingSigner.params.value = null;
        HoldingOKPO.params.value = null;
        HoldingAcc.params.value = null;
        HoldingAdress.params.value = null;
    } else {
        let HoldingUnitId = HoldingUnit.params.value.id;
        let dataHolding = await getHoldingparameters(urlResolver, requestManager, HoldingUnitId);
        if (HoldingSigner) {
            HoldingSigner.params.value = dataHolding['signerFIO'];
        } else {

        }

        HoldingINN.params.value = dataHolding['inn'];

        HoldingOKPO.params.value = dataHolding['okpo'];
        HoldingAcc.params.value = dataHolding['accountInfo'];
        HoldingAdress.params.value = dataHolding['adress'];

    }

}

export async function getHoldingparameters(urlResolver: UrlResolver, requestManager: IRequestManager, holdingId: String) {
    let url = urlResolver.resolveApiUrl("GetHoldingInfo", "HoldingService");
    url += "?id=" + holdingId;
    return requestManager.get(url)
}

export async function addSumnds(sender: Layout) {
    let ContractSum = sender.layout.controls.ContractSum;
    let NDSType = sender.layout.controls.NDSType;
    let ContractSumValue = ContractSum.params.value;
    let NDSValue = NDSType.params.value.name;
    let NDS = sender.layout.controls.NDS;
    let SumNDS = sender.layout.controls.SumNDS;
    if (NDSType != "НДС не облагается" && NDSType != "Смешанная" && ContractSumValue != null) {
        let trueNDSValue = Number(NDSValue.slice(0, -1));

        let netPrice: number;
        if (trueNDSValue == 20) {
            netPrice = (ContractSumValue * 0.2) / 1.2
        } else if (trueNDSValue == 10) {
            netPrice = (ContractSumValue * 0.1) / 1.1
        } else {
            netPrice = 0;
        }
        NDS.params.value = netPrice;
        SumNDS.params.value = ContractSumValue - netPrice
    }


}

export async function isADuplicate(sender: Layout,args: ICancelableEventArgs<any>) {
    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);
    let cardId = sender.layout.cardInfo.id;
    args.wait();


    let responceDuplicate = await duplicate(urlResolver, requestManager, cardId);

    args.accept();


    if (responceDuplicate) {
        let comments:Comments = sender.layout.controls.comments;
        comments.addComment('Возможен дубликат');
        MessageBox.ShowWarning("Возможен дубликат")



    }

}






export async function duplicate(urlResolver: UrlResolver, requestManager: IRequestManager, cardId) {
    let url = urlResolver.resolveApiUrl("FindDublContract", "ContractDoc");
    url += "?CardId=" + cardId;
    return requestManager.get(url)
}



export async function createSupplementaryAgreement() {

}

export async function saveTablePayment(sender: Layout) {
    await layoutManager.cardLayout.saveCard();
    MessageBox.ShowInfo("Сохранение успешно выполнено", "Сохранение")

}

export async function addSumNDSToPaymentTableText(sender, e: IDataChangedEventArgsEx<any>) {

    let controls = sender.layout.controls;

    let sumWithNDSs = controls.get('sumWithNDS');
    let summWithoutNDSs = controls.get('summWithoutNDS');
    let NDSRates = controls.get('rateNDS');
    let cardLinkOfBills = controls.get('cardLinkOfBill')
    if (NDSRates.indexOf((sender)) >= 0) {
        var rowIndex = NDSRates.indexOf(sender)
    } else {
        rowIndex = sumWithNDSs.indexOf(sender);
    }
    if (rowIndex >= 0) {
        let summWithoutNDS = summWithoutNDSs[rowIndex];
        let NDSRate = NDSRates[rowIndex];
        let sumWithNDS = sumWithNDSs[rowIndex];
        let cardLinkOfBill = cardLinkOfBills[rowIndex];


        if(cardLinkOfBill.params.value == null) {
            if (NDSRate.params.value != null) {
                let NDSRateValue = NDSRate.params.value.name;
                let sumWithNDSValue = sumWithNDS.params.value;
                if (NDSRateValue != "НДС не облагается" && NDSRateValue != "Смешанная" && sumWithNDSValue != null) {
                    let trueNDSValue = Number(NDSRateValue.slice(0, -1));

                    let netPrice;

                    if (trueNDSValue == 20) {
                        netPrice = (sumWithNDSValue * 0.2) / 1.2
                    } else if (trueNDSValue == 10) {
                        netPrice = (sumWithNDSValue * 0.1) / 1.1
                    } else {
                        netPrice = 0;
                    }
                    summWithoutNDSs[rowIndex].params.value = sumWithNDSValue - netPrice;
                }


            }
        }else {
            console.log('Ссылка есть')
        }

    }


}

export async function addEmployeeManager(sender) {
    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);
    let employeeController = sender.layout.getService($EmployeeController);
    let employee = sender.layout.controls.Registrar;
    let employeeManager = sender.layout.controls.ContractResponsible;


    if(employee.params.value == null){

        employeeManager.params.value = null;

    } else {
        let employeeId = employee.value.id;
        let dataEmployee: string = await getEmployeeManager(urlResolver, requestManager, employeeId);
        let manager = employeeController.getEmployee(dataEmployee);
        manager.done(function (data) {
            employeeManager.params.value = data;
        })
    }
}

export async function getEmployeeManager(urlResolver: UrlResolver, requestManager: IRequestManager, employeeId: String): Promise<string> {
    let url = urlResolver.resolveApiUrl("GetManagerID", "EmployeeService");
    url += "?id=" + employeeId;
    return requestManager.get(url)
}

export async function addCardParamsOnTable() {

}

export async function addTrueCardparamsToPaymentTable(sender, e: IDataChangedEventArgsEx<any>) {
    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);
    let controls = sender.layout.controls;
    let cardLinkOfBills = controls.get("cardLinkOfBill");
    let PPs = controls.get('PP');
    let dateOfPayments = controls.get('dateOfPayment');
    let sumWithNDSs = controls.get('sumWithNDS');
    let articleRates = controls.get('articleRate');
    let rateNDSs = controls.get('rateNDS');
    let summWithoutNDSs = controls.get('summWithoutNDS');
    let typeOfProjects = controls.get('typeOfProject');
    let organizationPayers = controls.get('organizationPayer');
    let actualPayments = controls.get('dateTimePicker1');
    let rowIndex = cardLinkOfBills.indexOf(sender);
    if (rowIndex > -1) {
        let typeOfProject = typeOfProjects[rowIndex];
        let summWithoutNDS = summWithoutNDSs[rowIndex];
        let articleRate = articleRates[rowIndex];
        let cardLinkOfBill = cardLinkOfBills[rowIndex];
        let PP = PPs[rowIndex];
        let dateOfPayment = dateOfPayments[rowIndex];
        let sumWithNDS = sumWithNDSs[rowIndex];
        let rateNDS = rateNDSs[rowIndex];
        let organizationPayer = organizationPayers[rowIndex];
        let actualPayment = actualPayments[rowIndex];
        let linkOnCard = cardLinkOfBill.params.value.cardId;
        let cardParams = await getbillpaymentparams(urlResolver, requestManager, linkOnCard);

        typeOfProject.params.value = cardParams['project'];
        summWithoutNDS.value = cardParams['paySumm'];
        PP.params.value = cardParams['invState'];
        dateOfPayment.params.value = new Date(cardParams['payDate']);
        sumWithNDS.params.value = cardParams['paySummNDS'];
        articleRate.params.value = cardParams['payItem'];
        rateNDS.params.value = cardParams['rateNDS'];
        organizationPayer.params.value = cardParams['holdingUnit'];
        actualPayment.params.value = cardParams['factPDate'];
    }
}

export async function getbillpaymentparams(urlResolver: UrlResolver, requestManager: IRequestManager, cardid: String) {
    let url = urlResolver.resolveApiUrl("GetInvoiceData", "CardInvoice");
    url += "?CardId=" + cardid;
    return requestManager.get(url)
}

export async function updateTablePaymentCardparams(sender, e: IDataChangedEventArgsEx<any>) {
    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);
    let controls = sender.layout.controls;
    let tablePayment = controls.get('chartPaymentTable');

    let tablePaymentLength = tablePayment.rows.length;
    if (tablePaymentLength > 0) {
        let PPs = controls.get('PP');
        let linkS = controls.get('cardLinkOfBill');
        let articleRates = controls.get('articleRate');

        let actualPayments = controls.get('dateTimePicker1');
        let dateOfPayments = controls.get('dateOfPayment');
        let sumWithNDSs = controls.get('sumWithNDS');

        let rateNDSs = controls.get('rateNDS');
        let summWithoutNDSs = controls.get('summWithoutNDS');
        let typeOfProjects = controls.get('typeOfProject');
        let organizationPayers = controls.get('organizationPayer');
        var masLinks = [];
        var masStates = [];
        for (let i = 0; i < PPs.length; i++) {

            masStates.push(PPs[i].value)

        }
        for (let i = 0; i < linkS.length; i++) {

            masLinks.push(linkS[i].value)

        }


        for (let i = 0; i < masStates.length; i++) {

            if (masStates[i] != 'Оплачен' || masStates[i] != 'Заблокирован окончательно') {


                if (masLinks[i] != null) {
                    let thisLink = masLinks[i].cardId;

                    let cardParams = await getbillpaymentparams(urlResolver, requestManager, thisLink);
                    let typeOfProject = typeOfProjects[i];
                    let summWithoutNDS = summWithoutNDSs[i];
                    let articleRate = articleRates[i];
                    let PP = PPs[i];
                    let dateOfPayment = dateOfPayments[i];
                    let sumWithNDS = sumWithNDSs[i];
                    let rateNDS = rateNDSs[i];
                    let organizationPayer = organizationPayers[i];
                    let actualPayment = actualPayments[i]
                    typeOfProject.params.value = cardParams['project'];
                    summWithoutNDS.params.value = cardParams['paySumm'];
                    PP.params.value = cardParams['invState'];
                    dateOfPayment.params.value = new Date(cardParams['payDate']);
                    sumWithNDS.params.value = cardParams['paySummNDS'];
                    articleRate.params.value = cardParams['payItem'];
                    rateNDS.params.value = cardParams['rateNDS'];
                    organizationPayer.params.value = cardParams['holdingUnit'];
                    actualPayment.params.value = cardParams['factPDate'];
                }
            }
        }


    }
}

export async function viewAndAddPartnerData(sender: Layout) {
    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);
    let mainBlock = sender.layout.controls.mainBlock;
    let modalBlock = sender.layout.controls.modalBlock;
    let partner = sender.layout.controls.PartnerCompany;
    let tableParamsPartner = sender.layout.controls.tableParamsPartner;
    let id = partner.params.value.id;

    let dataDepartment = await getPartnerData(urlResolver, requestManager, id);
    mainBlock.params.visibility = false;
    modalBlock.params.visibility = true;




    let lengthDataDepartment = dataDepartment['account'].length;
    for (let i = 0; i < lengthDataDepartment; i++) {

        if (tableParamsPartner.rows.length < lengthDataDepartment) {
            await tableParamsPartner.addRow();

            let accInfos = sender.layout.controls.accInfo;
            let accIds = sender.layout.controls.accIDs;
            let accInfo = accInfos[i];
            let accId = accIds[i];
            accId.params.value = dataDepartment['account'][i]['accId'];
            accInfo.params.value = dataDepartment['account'][i]['accInfo'];

        } else {

        }


    }

}

export async function getPartnerData(urlResolver: UrlResolver, requestManager: IRequestManager, partnerId) {
    let url = urlResolver.resolveApiUrl("GetPartnerAccInfo", "PartnerService");
    url += "?id=" + partnerId;
    return requestManager.get(url)
}

export async function checkTablePartnerCheckBox(sender: CheckBox, e: IDataChangedEventArgsEx<any>) {
    let partnersCheckBoxs = sender.layout.controls.partnersCheckBox;
    let rowIndex = partnersCheckBoxs.indexOf(sender);
    let partnersCheckBoxsLength = partnersCheckBoxs.length;
    for (let i = 0; i < partnersCheckBoxsLength; i++) {
        partnersCheckBoxs[i].value = false;
    }
    let partnersCheckBox = partnersCheckBoxs[rowIndex]
    partnersCheckBox.value = true;
}

export async function addParamsToParnterOfTablePartner(sender) {
    let mainBlock = sender.layout.controls.mainBlock;
    let modalBlock = sender.layout.controls.modalBlock;
    let partnersCheckBoxs = sender.layout.controls.partnersCheckBox;
    let partnersCheckBoxsLength = partnersCheckBoxs.length;
    let accInfos = sender.layout.controls.accInfo;
    let accIds = sender.layout.controls.accIDs;
    let accId = sender.layout.controls.accID;
    let PartnerAcc = sender.layout.controls.PartnerAcc;
    let tableParamsPartner = sender.layout.controls.tableParamsPartner;
    for (let i = 0; i < partnersCheckBoxsLength; i++) {
        if (partnersCheckBoxs[i].value == true) {
            var trueIndex = i;
        }
    }
    let accInfo = accInfos[trueIndex];
    let accIdq = accIds[trueIndex];

    let accInfoParams = accInfo.params.value;
    accId.params.value = accIdq.value;

    PartnerAcc.params.value = accInfoParams;

    for (let i=0; i<tableParamsPartner.rows.length; i++){
        let rows = tableParamsPartner.rows
        tableParamsPartner.removeRow(rows[0])

    }
    mainBlock.params.visibility = true;
    modalBlock.params.visibility = false;

}

export async function canselModalDialog(sender) {
    let mainBlock = sender.layout.controls.mainBlock;
    let modalBlock = sender.layout.controls.modalBlock;
    let tableParamsPartner = sender.layout.controls.tableParamsPartner;


    for (let i=0; i<tableParamsPartner.rows.length; i++){
        let rows = tableParamsPartner.rows
            tableParamsPartner.removeRow(rows[0])

    }
    mainBlock.params.visibility = true;
    modalBlock.params.visibility = false;

}

export async function showCreateTemplateButton(layout: Layout) {
    let holdingUnit = layout.controls.HoldingUnit;
    let docKind = layout.controls.DocKind;
    let contractKind = layout.controls.ContractKind;
    let templateButton = layout.controls.templateButton;

    if (holdingUnit.value.name == 'Айньюс' && docKind.value.name == 'Договор' && contractKind.value.name == 'Дистрибуция') {
        templateButton.params.visibility = true;
    } else if (holdingUnit.value.name == 'Диджитал Ньюс' && docKind.value.name == 'Договор' && contractKind.value.name == 'ИП авторский') {
        templateButton.params.visibility = true;
    } else if (holdingUnit.value.name == 'Диджитал Ньюс' && docKind.value.name == 'Договор' && contractKind.value.name == 'Физическое лицо авторский') {
        templateButton.params.visibility = true;
    } else if (holdingUnit.value.name == 'МЭШ' && docKind.value.name == 'Договор' && contractKind.value.name == 'Размещение рекламы') {
        templateButton.params.visibility = true;
    } else {
        templateButton.params.visibility = false;
    }

}


export async function addCommentIfUserInitiator(sender:Layout) {
    let modalBlocked = sender.layout.controls.modalBlocked;
    let rightIndentBlock =sender.layout.controls.rightIndentBlock;
    let contentBlock = sender.layout.controls.contentBlock;
    let leftIndentBlock = sender.layout.controls.leftIndentBlock;
    rightIndentBlock.params.visibility = false;
    contentBlock.params.visibility = false;
    leftIndentBlock.params.visibility = false;
    modalBlocked.params.visibility = true;

}

export async function cancelModalBlock(sender:Layout) {
    let modalBlocked = sender.layout.controls.modalBlocked;
    let rightIndentBlock =sender.layout.controls.rightIndentBlock;
    let contentBlock = sender.layout.controls.contentBlock;
    let leftIndentBlock = sender.layout.controls.leftIndentBlock;
    rightIndentBlock.params.visibility = true;
    contentBlock.params.visibility = true;
    leftIndentBlock.params.visibility = true;
    modalBlocked.params.visibility = false;
}
export async function changeStateToBlocked(sender:Layout) {
    let thisLogInUser = sender.layout.getService($CurrentEmployee);
    let thisLogInUserId = thisLogInUser.id;
    let iniciator:Employee = sender.layout.controls.Registrar;
    let iniciatorId = iniciator.params.value.id;
    let comments:Comments = sender.layout.controls.comments;
    let reqiredComment = sender.layout.controls.reqiredComment;
    let reqiredCommentValue = reqiredComment.params.value;
    let employee = sender.layout.controls.employee1;

    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);

    
    let cardId = sender.layout.cardInfo.id;

    let BlockApproved = sender.layout.controls.BlockApproved;
    let state = sender.layout.controls.state;
    let stateId = state.params.value.stateId;
    let BlockApprovedAfter = sender.layout.controls.BlockApprovedAfter;
    let cardManagement:CardManagement = sender.layout.controls.cardManagement;
    if(iniciatorId == thisLogInUserId && reqiredCommentValue == null){

        alert('Введите обязательный комментарий')
    } else {

        if (stateId == '6a5f2579-2413-435d-816d-8f71d9e3c6a4' || stateId == '9288f06f-4fe4-4438-b972-80f193671119' || stateId == 'F15FF374-7792-4273-823F-6C36DEA9D6E9') {

            BlockApproved.params.value = true;
            await BlockApproved.save();
            BlockApprovedAfter.params.value = false;
            await BlockApprovedAfter.save();
            console.log(reqiredCommentValue)
            if(reqiredCommentValue != null){
                await comments.addComment(reqiredCommentValue);
            }
            employee.params.value = thisLogInUser;
            await employee.save();
            await layoutManager.cardLayout.changeState('ac38bdc0-a8e7-4429-88b8-ae2e4157d727');
            await createTrueDidgest(urlResolver, requestManager, cardId);

            await cardManagement.refresh();

        } else if (stateId == '85842097-dcd1-4657-818a-b555e6fe4604' || stateId == 'DC686180-A8EA-42C9-BDDC-7FD3D1A2164B') {
            if(reqiredCommentValue != null){
                await comments.addComment(reqiredCommentValue);
            }
            employee.params.value = thisLogInUser;
            await employee.save();
            await layoutManager.cardLayout.changeState('ac38bdc0-a8e7-4429-88b8-ae2e4157d727');
            await createTrueDidgest(urlResolver, requestManager, cardId);
            await changeCardParams(urlResolver, requestManager, cardId);

            await cardManagement.refresh();

        }
    }
}

export async function changeCardParams(urlResolver: UrlResolver, requestManager: IRequestManager, cardId) {
    let url = urlResolver.resolveApiUrl("BlocketItemClick", "CardInvoice");
    url += "?CardId=" + cardId;
    return requestManager.get(url)
}


export async function changeStateBackToPreparation(sender:Layout) {
    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);
    let cardId = sender.layout.cardInfo.id;
    let BlockApproved = sender.layout.controls.BlockApproved;
    let cardManagement:CardManagement = sender.layout.controls.cardManagement;
    let BlockApprovedAfter = sender.layout.controls.BlockApprovedAfter;
    BlockApprovedAfter.params.value = false;
    await BlockApprovedAfter.save();
    await layoutManager.cardLayout.changeState('0a0b903e-73d1-41fc-a407-12fa83b4a2e9');

    await createTrueDidgest(urlResolver, requestManager, cardId);
    await cardManagement.refresh();
}

export async function returnToAgreement(sender:Layout) {
    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);
    let cardId = sender.layout.cardInfo.id;
    let cardManagement:CardManagement = sender.layout.controls.cardManagement;

    await layoutManager.cardLayout.changeState('9962e111-b92f-423f-8d59-8922bb06bd95');

    await createTrueDidgest(urlResolver, requestManager, cardId);
    await cardManagement.refresh();
}


export async function createContractWithParams(sender:Layout) {
    let RegNum:Numerator = sender.layout.controls.RegNum;
    let RegNumValue = RegNum.params.value;
    ////////////////////////////////
    let HoldingUnit = sender.layout.controls.HoldingUnit;
    let HoldingUnitValue = HoldingUnit.params.value;
    let HoldingINN = sender.layout.controls.HoldingINN;
    let HoldingINNValue = HoldingINN.params.value;
    let HoldingOKPO = sender.layout.controls.HoldingOKPO;
    let HoldingOKPOValue = HoldingOKPO.params.value;
    let HoldingAdress = sender.layout.controls.HoldingAdress;
    let HoldingAdressValue = HoldingAdress.params.value;
    let HoldingAcc = sender.layout.controls.HoldingAcc;
    let HoldingAccValue = HoldingAcc.params.value;
    let HoldingSigner = sender.layout.controls.HoldingSigner;
    let HoldingSignerValue = HoldingSigner.params.value;
    ////////////////////////////////////
    let PartnerCompany = sender.layout.controls.PartnerCompany;
    let PartnerCompanyValue = PartnerCompany.params.value;
    let PartnerINN = sender.layout.controls.PartnerINN;
    let PartnerINNValue = PartnerINN.params.value;
    let PartnerOKPO = sender.layout.controls.PartnerOKPO;
    let PartnerOKPOValue = PartnerOKPO.params.value;
    let PartnerAdress = sender.layout.controls.PartnerAdress;
    let PartnerAdressValue = PartnerAdress.params.value;
    let PartnerAcc = sender.layout.controls.PartnerAcc;
    let PartnerAccValue = PartnerAcc.params.value;
    let PartnerEmpl = sender.layout.controls.PartnerEmpl;
    let PartnerEmplValue = PartnerEmpl.params.value;
    let PartnerPerson = sender.layout.controls.PartnerPerson;
    let PartnerPersonValue = PartnerPerson.params.value;
    let PartnerRegNum = sender.layout.controls.PartnerRegNum;
    let PartnerRegNumValue = PartnerRegNum.params.value;
    let ContractSubject = sender.layout.controls.ContractSubject;
    let ContractSubjectValue = ContractSubject.params.value;
    let cardId = sender.layout.cardInfo.id;
    let documentName = sender.layout.controls.documentName;
    let documentNameValue = documentName.params.value;

const newParamsToDocument = {
    link:{
        cardId: cardId,
        cardDigest: documentNameValue,
        cardViewAllowed: true,
        mainFileReadAllowed: true
    },
    ContractSubject:ContractSubjectValue,
    PartnerRegNum:PartnerRegNumValue,
    Numerator:RegNumValue,
    HoldingUnit: HoldingUnitValue,
    HoldingINN:HoldingINNValue,
    HoldingOKPO:HoldingOKPOValue,
    HoldingAdress:HoldingAdressValue,
    HoldingAcc:HoldingAccValue,
    HoldingSigner:HoldingSignerValue,
    PartnerCompany:PartnerCompanyValue,
    PartnerINN:PartnerINNValue,
    PartnerOKPO:PartnerOKPOValue,
    PartnerAdress:PartnerAdressValue,
    PartnerAcc:PartnerAccValue,
    PartnerEmpl:PartnerEmplValue,
    PartnerPerson:PartnerPersonValue,
    KindOfDocument:{
        id: "3180e469-5ce9-4699-a478-f91d6c8dffa0",
        name: "Дополнительное соглашение",
        description: "",
        nodeType: 1,
        childrenLoaded: true,
        children: null
    }
};
localStorage.setItem('dataCard', JSON.stringify(newParamsToDocument));


 window.open('#/NewCard/b9f7bfd7-7429-455e-a3f1-94ffb569c794/9c63597b-04f9-4624-8fbd-377345866339/00000000-0000-0000-0000-000000000000');
    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);
    let parentCardId = layoutManager.cardLayout.cardInfo.id
    let timestamp = layoutManager.cardLayout.cardInfo.timestamp;
    setTimeout(async function () {
        let childrenCardId = localStorage.getItem('childrenCardId')
        await addLinkToLinks(urlResolver, requestManager, childrenCardId, parentCardId, timestamp);
    },5000)


}



export async function addLinkToLinks(urlResolver: UrlResolver, requestManager: IRequestManager, childrenCardId, parentCardId, timestamp) {
    let url = urlResolver.resolveApiUrl("addExistingCardLink", "layoutLinks");
    let postdata = {
        sourceCardId: parentCardId,
        sourceCardTimestamp: timestamp,
        destinationCardId: childrenCardId,
        linkTypeId: "90d0724e-08f4-4391-a0b0-3f4b6bbeefa3",
        saveHardLink: false,
        editOperation: "00000000-0000-0000-0000-000000000000",
        isReport: false,
        isFile: false,
        linksBinding:{
            dataSourceResolverId: "00000000-0000-0000-0000-000000000000",
            sectionId: "30eb9b87-822b-4753-9a50-a1825dca1b74",
            fieldAlias: "ReferenceList"
        }

    }
    return requestManager.post(url, JSON.stringify(postdata))

}

export async function checkLocalStorageForKeyAndAddData(layout:Layout) {
        let cardId = layout.cardInfo.id;
        localStorage.setItem('childrenCardId', cardId);
    if (localStorage.getItem('dataCard') !== null) {

        let raw = localStorage.getItem('dataCard');
        let dataCard = JSON.parse(raw);
        let RegNum:Numerator = layout.controls.RegNum;
        let HoldingUnit = layout.controls.HoldingUnit;
        let PartnerCompany = layout.controls.PartnerCompany;
        let PartnerAcc = layout.controls.PartnerAcc;
        let DocKind = layout.controls.DocKind
        let PartnerRegNum = layout.controls.PartnerRegNum;
        let PartnerEmpl = layout.controls.PartnerEmpl;
        let PartnerPerson = layout.controls.PartnerPerson;
        let ContractSubject = layout.controls.ContractSubject;
        let parentCardLink = layout.controls.parentCardLink;
        ContractSubject.params.value = dataCard['ContractSubject'];
        RegNum.params.value = dataCard['Numerator']
        HoldingUnit.params.value = dataCard['HoldingUnit'];
        PartnerCompany.params.value = dataCard['PartnerCompany'];
        PartnerAcc.params.value = dataCard['PartnerAcc'];
        DocKind.params.value = dataCard['KindOfDocument'];
        PartnerRegNum.params.value = dataCard['PartnerRegNum'];
        PartnerEmpl.params.value = dataCard['PartnerEmpl'];
        PartnerPerson.params.value = dataCard['PartnerPerson'];
        parentCardLink.value = dataCard['link'];
        localStorage.removeItem('dataCard')
    }
}

export async function testLink(sender:Layout) {
    let links:CardLink = sender.layout.controls.cardLink1;
    console.log(links)

}

export async function changeDateOfPayment(sender:Layout) {
let leftIndentBlock = sender.layout.controls.leftIndentBlock;
let contentBlock = sender.layout.controls.contentBlock;
let rightIndentBlock = sender.layout.controls.rightIndentBlock;
let modalDateBlock = sender.layout.controls.modalDateBlock;
let newComment = sender.layout.controls.newComment;
    leftIndentBlock.params.visibility = false;
    contentBlock.params.visibility = false;
    rightIndentBlock.params.visibility = false;
    modalDateBlock.params.visibility = true;
    let newDateofPayment = sender.layout.controls.newDateofPayment;
    newDateofPayment.params.value = null;
    newComment.params.value = null;

}

export async function validateNewDateOfPayment(sender:Layout) {
    let newDateofPayment = sender.layout.controls.newDateofPayment;
    let validateLabelData = sender.layout.controls.validateLabelData
    let newDateofPaymentValue = new Date(newDateofPayment.params.value);
    let now = new Date();
    let minDate = new Date(now.setDate(now.getDate()+1));

    if(minDate > newDateofPaymentValue){
        validateLabelData.params.visibility = true;
        newDateofPayment.params.value = null;
    } else {
        validateLabelData.params.visibility = false;
    }
}

export async function clickOkButtonModalMewDateOfPayment(sender:Layout, args: CancelableEventArgs<any>) {
    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);
    let newDateofPayment = sender.layout.controls.newDateofPayment;
    let leftIndentBlock = sender.layout.controls.leftIndentBlock;
    let contentBlock = sender.layout.controls.contentBlock;
    let rightIndentBlock = sender.layout.controls.rightIndentBlock;
    let modalDateBlock = sender.layout.controls.modalDateBlock;
    let PlanDatePay = sender.layout.controls.PlanDatePay;
    let newComment = sender.layout.controls.newComment;
    let newDate = newDateofPayment.params.value;
    let comments:Comments = sender.layout.controls.comments;
    let cardId = sender.layout.cardInfo.id;
    let cardManagement:CardManagement = sender.layout.controls.cardManagement
    if(newDateofPayment.params.value == null){
        alert('Введите дату или нажмите отмена');
        return
    } else if(newComment.params.value != null){


      PlanDatePay.params.value = newDate;
        leftIndentBlock.params.visibility = true;
        contentBlock.params.visibility = true;
        rightIndentBlock.params.visibility = true;
        modalDateBlock.params.visibility = false;

        await PlanDatePay.save();

        comments.addComment('Изменена дата оплаты счета на '+ moment(newDate).format('L') +' Комментарий:'+ newComment.params.value);

    } else {

        PlanDatePay.params.value = newDate;
        leftIndentBlock.params.visibility = true;
        contentBlock.params.visibility = true;
        rightIndentBlock.params.visibility = true;
        modalDateBlock.params.visibility = false;
        await PlanDatePay.save();

    }

   await layoutManager.cardLayout.changeState('9962e111-b92f-423f-8d59-8922bb06bd95');
    await deleteCardFromReestr(urlResolver, requestManager, cardId);
    await createTrueDidgest(urlResolver, requestManager, cardId);
    cardManagement.refresh();
}

export async function clickCancelButtonModalNewDateOfPayment(sender:Layout) {
    let leftIndentBlock = sender.layout.controls.leftIndentBlock;
    let contentBlock = sender.layout.controls.contentBlock;
    let rightIndentBlock = sender.layout.controls.rightIndentBlock;
    let modalDateBlock = sender.layout.controls.modalDateBlock;
    leftIndentBlock.params.visibility = true;
    contentBlock.params.visibility = true;
    rightIndentBlock.params.visibility = true;
    modalDateBlock.params.visibility = false;
}

export async function deleteCardFromReestr(urlResolver: UrlResolver, requestManager: IRequestManager, cardId) {
    let url = urlResolver.resolveApiUrl("RemoveLink", "CardInvoice");
    url += "?CardId=" + cardId;
    return requestManager.get(url);
}

export async function finalyBlockedModal(sender:Layout) {
    let leftIndentBlock = sender.layout.controls.leftIndentBlock;
    let contentBlock = sender.layout.controls.contentBlock;
    let rightIndentBlock = sender.layout.controls.rightIndentBlock;
    let modalFinalyBlocked = sender.layout.controls.modalFinalyBlocked;

    leftIndentBlock.params.visibility = false;
    contentBlock.params.visibility = false;
    rightIndentBlock.params.visibility = false;
    modalFinalyBlocked.params.visibility = true;

}

export async function clickCancelButtonModalFinalyBlock(sender:Layout) {
    let leftIndentBlock = sender.layout.controls.leftIndentBlock;
    let contentBlock = sender.layout.controls.contentBlock;
    let rightIndentBlock = sender.layout.controls.rightIndentBlock;
    let modalFinalyBlocked = sender.layout.controls.modalFinalyBlocked;

    leftIndentBlock.params.visibility = true;
    contentBlock.params.visibility = true;
    rightIndentBlock.params.visibility = true;
    modalFinalyBlocked.params.visibility = false;
}

export async function clickOkButtonModalFinalyBlock(sender:Layout) {
    let cardManagement:CardManagement = sender.layout.controls.cardManagement
    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);
    let thisLogInUser = sender.layout.getService($CurrentEmployee);
    let cardId = sender.layout.cardInfo.id;
    let employee = sender.layout.controls.employee1;
let newCommentFinalyBlock = sender.layout.controls.newCommentFinalyBlock;
    let comments:Comments = sender.layout.controls.comments;
    if(newCommentFinalyBlock.params.value != null){
        let newCommentFinalyBlockValue = newCommentFinalyBlock.params.value;
        await comments.addComment(newCommentFinalyBlockValue);
        employee.params.value = thisLogInUser;
        await employee.save();
        await layoutManager.cardLayout.changeState('d73026df-a681-4421-9580-32476d81ffb4')
    } else {
        employee.params.value = thisLogInUser;
        await employee.save();
        await layoutManager.cardLayout.changeState('d73026df-a681-4421-9580-32476d81ffb4')
    }
    await deleteCardFromReestr(urlResolver, requestManager, cardId);
    cardManagement.refresh();
}


export async function addCssClassToBlockDocument(sender:Layout) {
    let PPs = sender.layout.controls.PP;
    let PPsLength = PPs.length;
    for(let i=0;i<PPsLength;i++){
        if(PPs[i].params.value == 'Заблокирован'){
            PPs[i].params.customCssClasses = 'Blocked';
            console.log(PPs[i].params.customCssClasses)
        }
    }
}



export async function DateOfSigning(sender:Layout) {
    let ContractEnd = sender.layout.controls.ContractEnd;
    let ContractEndValue = ContractEnd.params.value;
    let dateSigning = sender.layout.controls.dateSigning;

    let NoteDays = sender.layout.controls.NoteDays;
    let NoteDaysValue = NoteDays.params.value;

    dateSigning.params.value = moment(ContractEndValue).subtract(NoteDaysValue, 'd');
}


export async function addNewDateOfIncomingDocument(sender:Layout) {
    let dateOfRegistrationIncomingDocument = sender.layout.controls.dateOfRegistrationIncomingDocument;

    dateOfRegistrationIncomingDocument.params.value = new Date();

}

export async function agreementList(sender:AgreementList) {
    let cardId = layoutManager.cardLayout.getService($CardId);
    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);
    let agreementList = sender.layout.controls.agreementList;
    let DocKind = sender.layout.controls.DocKind
    let RegNum:Numerator = sender.layout.controls.RegNum
    let RegDate = sender.layout.controls.RegDate;
    let HoldingUnit = sender.layout.controls.HoldingUnit;
    let PartnerCompany = sender.layout.controls.PartnerCompany;
    let ContractSubject = sender.layout.controls.ContractSubject
    let Registrar = sender.layout.controls.Registrar;



    layoutManager.cardLayout.controls.agreementList.params.agreementReportOpening.subscribe(async (handler, args) => {

        args.data.model.documentName = `${DocKind.params.value.name} № ${RegNum.params.value.number} от ${moment(RegDate.params.value).format('L')}
        между ${HoldingUnit.params.value.name} и ${PartnerCompany.params.value.name} ${ContractSubject.params.value === null ? "" : ContractSubject.params.value}. Инициатор ${Registrar.params.value.displayName}`

    });


    agreementList.params.agreementReportOpened.subscribe(async (handler, args) => {
        let contentControl = args.contentControl;
        let columns = contentControl.columns;
        columns[0].hidden = true
        columns[1].hidden = true;
        columns[2].hidden = true;
        columns[3].hidden = true;
        columns[4].hidden = true;
        columns[5].hidden = true;
        let index = args.contentControl.columns.indexOf(args.contentControl.commentColumn);
        args.contentControl.columns.splice(index, 1)
        columns.push({
            name: "ФИО согласующего",
            wieght: 1,
            value: (item) => item.fio,
            class: 'fio'
        },{
            name: "Дата начала",
            wieght: 1,
            value: (item) => item.beginDate,
            class: 'beginDate'
        },{
            name: "Дата завершения",
            wieght: 1,
            value: (item) => item.endDate,
            class: 'endDate'
        },{
            name: "Принятое решение",
            wieght: 1,
            value: (item) => item.decision,
            class: 'decision'
        },{
            name: "Комментарии",
            wieght: 1,
            value: (item) => item.comment,
            class: 'comments'
        });



        let receivedFromSererItems = await getAgreement(urlResolver, requestManager, cardId);
        let ObjectMas = receivedFromSererItems['items']

        args.model.items = ObjectMas.map(serverItem => (

            {

            fio: serverItem['fio'],
            beginDate:moment(serverItem['beginDate']).format('DD.MM.YYYY HH:mm'),
            endDate:moment(serverItem['endDate']).isValid() ? moment(serverItem['endDate']).format('DD.MM.YYYY HH:mm') : '',
            decision:serverItem['decision'],
            comment:serverItem['comment']

        }));


        args.contentControl.forceUpdate();
    console.log(agreementList)

    });




}


export async function agreementListOrder(sender:AgreementList) {
    let cardId = layoutManager.cardLayout.getService($CardId);
    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);
    let agreementList = sender.layout.controls.agreementList;
    let numeratorOfOrder:Numerator = sender.layout.controls.numeratorOfOrder;
    let dateOfRegistrationOrder = sender.layout.controls.dateOfRegistrationOrder;
    let holdingUnit = sender.layout.controls.directoryDesignerRow2
    let registratorOfOrder = sender.layout.controls.registratorOfOrder
    layoutManager.cardLayout.controls.agreementList.params.agreementReportOpening.subscribe(async (handler, args) => {

        args.data.model.documentName = `Приказ № ${numeratorOfOrder.params.value.number} от 
        ${moment(dateOfRegistrationOrder.params.value).format('L')}, ${holdingUnit.params.value.name}. Инициатор:${registratorOfOrder.params.value.displayName}`

    });


    agreementList.params.agreementReportOpened.subscribe(async (handler, args) => {
        let contentControl = args.contentControl;
        let columns = contentControl.columns;
        columns[0].hidden = true
        columns[1].hidden = true;
        columns[2].hidden = true;
        columns[3].hidden = true;
        columns[4].hidden = true;
        columns[5].hidden = true;
        let index = args.contentControl.columns.indexOf(args.contentControl.commentColumn);
        args.contentControl.columns.splice(index, 1)
        columns.push({
            name: "ФИО согласующего",
            wieght: 1,
            value: (item) => item.fio,
            class: 'fio'
        },{
            name: "Дата начала",
            wieght: 1,
            value: (item) => item.beginDate,
            class: 'beginDate'
        },{
            name: "Дата завершения",
            wieght: 1,
            value: (item) => item.endDate,
            class: 'endDate'
        },{
            name: "Принятое решение",
            wieght: 1,
            value: (item) => item.decision,
            class: 'decision'
        },{
            name: "Комментарии",
            wieght: 1,
            value: (item) => item.comment,
            class: 'comments'
        });



        let receivedFromSererItems = await getAgreement(urlResolver, requestManager, cardId);
        let ObjectMas = receivedFromSererItems['items']

        args.model.items = ObjectMas.map(serverItem => (

            {

                fio: serverItem['fio'],
                beginDate:moment(serverItem['beginDate']).format('DD.MM.YYYY HH:mm'),
                endDate:moment(serverItem['endDate']).isValid() ? moment(serverItem['endDate']).format('DD.MM.YYYY HH:mm') : '',
                decision:serverItem['decision'],
                comment:serverItem['comment']

            }));


        args.contentControl.forceUpdate();
        console.log(columns)

    });



}

export async function agreementListMemo(sender:AgreementList) {
    let cardId = layoutManager.cardLayout.getService($CardId);
    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);
    let agreementList = sender.layout.controls.agreementList;
    let numerator:Numerator = sender.layout.controls.numerator;
    let dateOfRegistration = sender.layout.controls.dateTimePicker4;
    let holdingUnit = sender.layout.controls.directoryDesignerRow1;
    let iniciator = sender.layout.controls.employee2

    layoutManager.cardLayout.controls.agreementList.params.agreementReportOpening.subscribe(async (handler, args) => {

        args.data.model.documentName = `Служебная записка № ${numerator.params.value.number} от ${moment(dateOfRegistration.params.value).format('L')}, ${holdingUnit.params.value.name}. Инициатор: ${iniciator.params.value.displayName}`

    });


    agreementList.params.agreementReportOpened.subscribe(async (handler, args) => {
        let contentControl = args.contentControl;
        let columns = contentControl.columns;

        columns[0].hidden = true
        columns[1].hidden = true;
        columns[2].hidden = true;
        columns[3].hidden = true;
        columns[4].hidden = true;
        columns[5].hidden = true;
        let index = args.contentControl.columns.indexOf(args.contentControl.commentColumn);
        args.contentControl.columns.splice(index, 1)

        columns.push({
            name: "ФИО согласующего",
            wieght: 1,
            value: (item) => item.fio,
            class: 'fio'
        },{
            name: "Дата начала",
            wieght: 1,
            value: (item) => item.beginDate,
            class: 'beginDate'
        },{
            name: "Дата завершения",
            wieght: 1,
            value: (item) => item.endDate,
            class: 'endDate'
        },{
            name: "Принятое решение",
            wieght: 1,
            value: (item) => item.decision,
            class: 'decision'
        },{
            name: "Комментарии",
            wieght: 1,
            value: (item) => item.comment,
            class: 'comments'
        });



        let receivedFromSererItems = await getAgreement(urlResolver, requestManager, cardId);
        let ObjectMas = receivedFromSererItems['items']

        args.model.items = ObjectMas.map(serverItem => (

            {

                fio: serverItem['fio'],
                beginDate:moment(serverItem['beginDate']).format('DD.MM.YYYY HH:mm'),
                endDate:moment(serverItem['endDate']).isValid() ? moment(serverItem['endDate']).format('DD.MM.YYYY HH:mm') : '',
                decision:serverItem['decision'],
                comment:serverItem['comment']

            }));


        args.contentControl.forceUpdate();
        console.log(columns)

    });

}

export async function agreementListOutgoingDocument(sender:AgreementList) {
    let cardId = layoutManager.cardLayout.getService($CardId);
    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);
    let agreementList = sender.layout.controls.agreementList;
    let numerator:Numerator = sender.layout.controls.numeratorOfOutgoingDocument;
    let dateOfRegistration = sender.layout.controls.dateOfRegistration;
    let holdingUnit = sender.layout.controls.directoryDesignerRow2;
    let iniciator = sender.layout.controls.employee2

    layoutManager.cardLayout.controls.agreementList.params.agreementReportOpening.subscribe(async (handler, args) => {

        args.data.model.documentName = `Исходящее письмо №${numerator.params.value.number} от
        ${moment(dateOfRegistration.params.value).format('L')}, ${holdingUnit.params.value.name}. Инициатор:${iniciator.params.value.displayName} `

    });


    agreementList.params.agreementReportOpened.subscribe(async (handler, args) => {
        let contentControl = args.contentControl;
        let columns = contentControl.columns;
        columns[0].hidden = true
        columns[1].hidden = true;
        columns[2].hidden = true;
        columns[3].hidden = true;
        columns[4].hidden = true;
        columns[5].hidden = true;
        let index = args.contentControl.columns.indexOf(args.contentControl.commentColumn);
        args.contentControl.columns.splice(index, 1)

        columns.push({
            name: "ФИО согласующего",
            wieght: 1,
            value: (item) => item.fio,
            class: 'fio'
        },{
            name: "Дата начала",
            wieght: 1,
            value: (item) => item.beginDate,
            class: 'beginDate'
        },{
            name: "Дата завершения",
            wieght: 1,
            value: (item) => item.endDate,
            class: 'endDate'
        },{
            name: "Принятое решение",
            wieght: 1,
            value: (item) => item.decision,
            class: 'decision'
        },{
            name: "Комментарии",
            wieght: 1,
            value: (item) => item.comment,
            class: 'comments'
        });



        let receivedFromSererItems = await getAgreement(urlResolver, requestManager, cardId);
        let ObjectMas = receivedFromSererItems['items']

        args.model.items = ObjectMas.map(serverItem => (

            {

                fio: serverItem['fio'],
                beginDate:moment(serverItem['beginDate']).format('DD.MM.YYYY HH:mm'),
                endDate:moment(serverItem['endDate']).isValid() ? moment(serverItem['endDate']).format('DD.MM.YYYY HH:mm') : '',
                decision:serverItem['decision'],
                comment:serverItem['comment']

            }));


        args.contentControl.forceUpdate();
        console.log(columns)

    });
}


export async function agreementListRegisterOfPayment(sender:AgreementList) {
    let cardId = layoutManager.cardLayout.getService($CardId);
    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);
    let agreementList = sender.layout.controls.agreementList;
    let numerator:Numerator = sender.layout.controls.numerator1;
    let dateOfRegistration = sender.layout.controls.dateTimePicker1;
    let holdingUnit = sender.layout.controls.directoryDesignerRow1;

    layoutManager.cardLayout.controls.agreementList.params.agreementReportOpening.subscribe(async (handler, args) => {

        args.data.model.documentName = `Реестр на оплату №${numerator.params.value.number} от
        ${moment(dateOfRegistration.params.value).format('L')}, ${holdingUnit.params.value.name}.`

    });


    agreementList.params.agreementReportOpened.subscribe(async (handler, args) => {
        let contentControl = args.contentControl;
        let columns = contentControl.columns;
        columns[0].hidden = true
        columns[1].hidden = true;
        columns[2].hidden = true;
        columns[3].hidden = true;
        columns[4].hidden = true;
        columns[5].hidden = true;
        let index = args.contentControl.columns.indexOf(args.contentControl.commentColumn);
        args.contentControl.columns.splice(index, 1)

        columns.push({
            name: "ФИО согласующего",
            wieght: 1,
            value: (item) => item.fio,
            class: 'fio'
        },{
            name: "Дата начала",
            wieght: 1,
            value: (item) => item.beginDate,
            class: 'beginDate'
        },{
            name: "Дата завершения",
            wieght: 1,
            value: (item) => item.endDate,
            class: 'endDate'
        },{
            name: "Принятое решение",
            wieght: 1,
            value: (item) => item.decision,
            class: 'decision'
        },{
            name: "Комментарии",
            wieght: 1,
            value: (item) => item.comment,
            class: 'comments'
        });



        let receivedFromSererItems = await getAgreement(urlResolver, requestManager, cardId);
        let ObjectMas = receivedFromSererItems['items']

        args.model.items = ObjectMas.map(serverItem => (

            {

                fio: serverItem['fio'],
                beginDate:moment(serverItem['beginDate']).format('DD.MM.YYYY HH:mm'),
                endDate:moment(serverItem['endDate']).isValid() ? moment(serverItem['endDate']).format('DD.MM.YYYY HH:mm') : '',
                decision:serverItem['decision'],
                comment:serverItem['comment']

            }));


        args.contentControl.forceUpdate();
        console.log(columns)

    });
}







export async function getAgreement(urlResolver: UrlResolver, requestManager: IRequestManager, cardId:String) {
    let url = urlResolver.resolveUrl("GetReconciliationList", "Reconciliation");
    url += "?documentId=" + cardId;
    return requestManager.get(url);
}

export async function startCreateGroupTaskAndChangeState(sender:Layout) {
    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);
    let cardId = sender.layout.getService($CardId);
    let receivers = sender.layout.controls.receivers;
    if(receivers.value.length !=0){
        await createGroupTask(urlResolver,requestManager,cardId)
        await layoutManager.cardLayout.changeState('e9bc6b6c-29fe-4b92-8fc4-341f8a110c03');
    } else {
        MessageBox.ShowError('Заполните поле "Кому передано"');
    }


}

export async function createGroupTask(urlResolver: UrlResolver, requestManager: IRequestManager, cardId:String) {
    let url = urlResolver.resolveApiUrl("CreateTaskGroup", "TaskService");
    url += "?CardId=" + cardId;
    return requestManager.get(url);
}

export async function createLink(sender:Layout) {
    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);
    let cardId = sender.layout.getService($CardId);
    let link:CardLink = sender.layout.controls.Contract
    if(link.params.value != null){
        await crateLinkServer(urlResolver,requestManager, cardId)
    }
}

export async function crateLinkServer(urlResolver: UrlResolver, requestManager: IRequestManager, InvId:String) {
    let url = urlResolver.resolveApiUrl("CreateLink", "CardInvoice");
    url += "?InvId=" + InvId;
    return requestManager.get(url);
}

export async function generateNewNumberForContract(sender) {
    let cardId = sender.layout.cardInfo.id;
    let urlResolver = sender.layout.getService($UrlResolver)
    let requestManager = sender.layout.getService($RequestManager);

    sender.layout.params.cardSaved.subscribe(async (sndr, arg: ICancelableEventArgs<ILayoutSavedEventArgs>) => {
        arg.wait();
        let RegNum:Numerator = sndr.layout.controls.RegNum;
        let docKind = sndr.layout.controls.DocKind;
        if(RegNum.params.value.number == null && docKind.value.name != 'Дополнительное соглашение') {
            await RegNum.generateNewNumber(true, false);


            await createTrueDidgest(urlResolver, requestManager, cardId);
        } else {
            await createTrueDidgest(urlResolver, requestManager, cardId);
        }
        arg.accept();
    })
}


export async function changeNumeratorParams(sender) {
    let cardId = sender.layout.cardInfo.id;
    let urlResolver = sender.layout.getService($UrlResolver)
    let requestManager = sender.layout.getService($RequestManager);
    let HoldingUnit = sender.layout.controls.HoldingUnit;
    var HoldingUnitValueFirst = HoldingUnit.value.name
    sender.layout.params.cardSaved.subscribe(async (sndr, args: ICancelableEventArgs<ILayoutSavedEventArgs>)=>{
        let RegNum:Numerator = sender.layout.controls.RegNum;
        let HoldingUnit = sndr.layout.controls.HoldingUnit;
        let HoldingUnitValueSecond = HoldingUnit.value.name
        if(HoldingUnitValueFirst != HoldingUnitValueSecond){

            await RegNum.clearNumber();
            await RegNum.generateNewNumber(true,false);
            await createTrueDidgest(urlResolver, requestManager, cardId);
        } else {
            await createTrueDidgest(urlResolver, requestManager, cardId);
        }
    })




}


export async function addRegistratorRegNumberAndChangeStateInOutgoingDocumnet(sender) {
    let urlResolver = sender.layout.getService($UrlResolver)
    let requestManager = sender.layout.getService($RequestManager);
    let cardId = layoutManager.cardLayout.getService($CardId);
    let dateOfRegistration = sender.layout.controls.dateOfRegistration;
    let registrator = sender.layout.controls.registrator;
    let numeratorOfOutgoingDocument:Numerator = sender.layout.controls.numeratorOfOutgoingDocument;
    let thisLogInUser = sender.layout.getService($CurrentEmployee);
    let cardManagement:CardManagement = sender.layout.controls.cardManagement;
    dateOfRegistration.params.value = new Date();
    registrator.params.value = thisLogInUser;
    await dateOfRegistration.save();
    await registrator.save();
    if(numeratorOfOutgoingDocument.params.value.number != null){

        await layoutManager.cardLayout.changeState('8c1c52e5-997d-46f8-a32a-c0fd2c421266')
        await createTrueDidgest(urlResolver, requestManager, cardId);
        cardManagement.refresh();
    } else {
        await numeratorOfOutgoingDocument.generateNewNumber();

        await layoutManager.cardLayout.changeState('8c1c52e5-997d-46f8-a32a-c0fd2c421266')
        await createTrueDidgest(urlResolver, requestManager, cardId);
        cardManagement.refresh();
    }

}


export async function addNumber(sender) {
    let dateOfRegistration = sender.layout.controls.dateOfRegistrationOrder;
    let urlResolver = sender.layout.getService($UrlResolver)
    let requestManager = sender.layout.getService($RequestManager);
    let cardId = layoutManager.cardLayout.getService($CardId);
    let numeratorOfOrder:Numerator = sender.layout.controls.numeratorOfOrder;
    let cardManagement:CardManagement = sender.layout.controls.cardManagement;
    dateOfRegistration.params.value = new Date();
    await dateOfRegistration.save();
        if(numeratorOfOrder.params.value.number != null){
            await layoutManager.cardLayout.changeState('db915194-53c4-4434-ada7-0364e5eccd14');
            await createTrueDidgest(urlResolver, requestManager, cardId);
            cardManagement.refresh();
        } else {
            await numeratorOfOrder.generateNewNumber();
            await layoutManager.cardLayout.changeState('db915194-53c4-4434-ada7-0364e5eccd14');
            await createTrueDidgest(urlResolver, requestManager, cardId);
            cardManagement.refresh();
        }

}


export async function defineTypeTemplate(sender:Layout) {
    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);
    let holdingUnit = sender.layout.controls.HoldingUnit;
    let docKind = sender.layout.controls.DocKind;
    let contractKind = sender.layout.controls.ContractKind;
    let cardId = layoutManager.cardLayout.getService($CardId);
    let cardManagement:CardManagement = sender.layout.controls.cardManagement;
    if (holdingUnit.value.name == 'Айньюс' && docKind.value.name == 'Договор' && contractKind.value.name == 'Дистрибуция') {
        await fillTemplate(urlResolver,requestManager,cardId,'FillContractINewsDistributionTemplateFile')
    } else if (holdingUnit.value.name == 'Диджитал Ньюс' && docKind.value.name == 'Договор' && contractKind.value.name == 'ИП авторский') {
        await fillTemplate(urlResolver,requestManager,cardId,'FillContractDigitalNewsIPTemplateFile')
    } else if (holdingUnit.value.name == 'Диджитал Ньюс' && docKind.value.name == 'Договор' && contractKind.value.name == 'Физическое лицо авторский') {
        await fillTemplate(urlResolver,requestManager,cardId,'FillContractDigitalNewsIndividualTemplateFile')
    } else if (holdingUnit.value.name == 'МЭШ' && docKind.value.name == 'Договор' && contractKind.value.name == 'Размещение рекламы') {
        await fillTemplate(urlResolver,requestManager,cardId,'FillContractMashAdvertisingTemplateFile')
    } else {
        console.log('нет шаблона')
    }
    await cardManagement.refresh();
}

export async function fillTemplate(urlResolver: UrlResolver, requestManager: IRequestManager, cardId:string, action:string) {
    let url = urlResolver.resolveUrl(action, "FillTemplates");
    url += "?documentId=" + cardId;
    return requestManager.get(url);
}


export async function showArchiveBlock(sender:Layout) {


    let archiveBlock = sender.layout.controls.archiveBlock;

    if(layoutManager.cardLayout.editOperations.available('71e899bc-dbe7-4ed1-b304-acd390cf8734')){
        archiveBlock.params.visibility = true;
    }
}





export async function getIdUnit(sender:Layout) {
    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);
    let staffUnit = sender.layout.controls.staffDepartment1;
    let recipient = sender.layout.controls.recipient;
    let staffUnitId = staffUnit.value.id;
    let UnitManager = await getUnitManager(urlResolver, requestManager, staffUnitId);
    recipient.params.value = UnitManager;

}

export async function getUnitManager(urlResolver: UrlResolver, requestManager: IRequestManager, id:string) {
    let url = urlResolver.resolveApiUrl("GetUnitManager", "EmployeeService");
    url += "?id=" + id;
    return requestManager.get(url);
}


export async function getIdOutgoindDocumentAnd(sender) {
    let cardId = layoutManager.cardLayout.getService($CardId);
    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);
    let cardManagement:CardManagement = sender.layout.controls.cardManagement;
    let responce = await checkTemplate(urlResolver, requestManager, cardId);
    if(responce == false){
        MessageBox.ShowError('Шаблон файла не найден.')
    } else {
        cardManagement.refresh();
    }

}

export async function checkTemplate(urlResolver: UrlResolver, requestManager: IRequestManager, id:string) {
    let url = urlResolver.resolveApiUrl("CreateFileTemplate", "OutgoingService");
    url += "?CardId=" + id;
    return requestManager.get(url);
}

export function test(sender) {
    let textArea1: TextArea = sender.layout.controls.textArea1;
    let textArea1Value = textArea1.params.value;
    let qqq = textArea1Value.replace(/\s/g, '');
 console.log(textArea1Value)
    console.log(qqq)
    let textArea1ValueNumber = Number(qqq);

    let trueValue = textArea1ValueNumber.toLocaleString('ru');

    textArea1.params.value = trueValue.toString();
}

export async function isNumeratorEmpty(sender) {
    let RegNum:Numerator = sender.layout.controls.RegNum;
    let regNumBlock = sender.layout.controls.regNumBlock;
    if(RegNum.params.value.number == null){
    regNumBlock.params.visibility = false;
    }
}

export async function refreshCard(sender) {
    sender.layout.params.cardSaved.subscribe(async (sndr, args: ICancelableEventArgs<ILayoutSavedEventArgs>)=>{
      let cardManagement:CardManagement = sndr.layout.controls.cardManagement;
      cardManagement.refresh();
    })
}


export async function changeStateOnCanceledOfContract(sender) {
    let cardId = layoutManager.cardLayout.getService($CardId);
    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);
    await layoutManager.cardLayout.changeState('93b1cd75-e4e4-4b5f-91a4-7281586ea978')
    await changeCardParams(urlResolver, requestManager, cardId);

}




export async function showButtonRelationOfCheckBox(sender) {
    let AgreementButton = sender.layout.controls.AgreementButton;
    let state:State = sender.layout.controls.state;
    let PrepareButton = sender.layout.controls.PrepareButton;
    let BlockApproved:CheckBox = sender.layout.controls.BlockApproved;
    let BlockApprovedAfter:CheckBox = sender.layout.controls.BlockApprovedAfter;
    console.log(state)
    if(state.params.value.stateId == '303fc6c3-6d2f-43bd-bb0e-ec394492ee03'){
        console.log("Состояние заблокирован");
        if(BlockApprovedAfter.value == true){
            PrepareButton.params.visibility = true;
        } else if(BlockApproved.value == true){
            AgreementButton.params.visibility = true;
        }

    }

}

export async function changeStateToAproved(sender) {
    layoutManager.cardLayout.changeState('9962e111-b92f-423f-8d59-8922bb06bd95')
}

export async function changeStateToPrepare(sender) {
layoutManager.cardLayout.changeState('0a0b903e-73d1-41fc-a407-12fa83b4a2e9')
}


export async function hasUserRights(sender) {
    if(!layoutManager.cardLayout.editOperations.available('96e9964f-6f4a-483a-80be-676f7fc44819')) {
        MessageBox.ShowError('Нет прав на создание данного типа карточек').done((context: any) => {
            let routerNavigation = sender.getService($RouterNavigation);
            routerNavigation.goTo('#/Dashboard');

        })
    }
}

export async function changeStateToAgreementAndAddExpressBill(sender) {
    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);
    let cardId = layoutManager.cardLayout.getService($CardId);
    let state:State = sender.layout.controls.state;
    let Urgently:CheckBox = sender.layout.controls.Urgently;
    let cardManagement:CardManagement = sender.layout.controls.cardManagement;
    if(state.params.value.stateId == 'cbbd9143-6b5b-4deb-a8e7-b4235a576fdc') {
        Urgently.value = true;
        await Urgently.save();


        await layoutManager.cardLayout.changeState('9962e111-b92f-423f-8d59-8922bb06bd95');
        console.log('После смены состояния')
        await createTrueDidgest(urlResolver, requestManager, cardId);
        await cardManagement.refresh();

    } else {
        await layoutManager.cardLayout.changeState('9962e111-b92f-423f-8d59-8922bb06bd95');
        await createTrueDidgest(urlResolver, requestManager, cardId);
    }
}

export async function generateNewNumberForIncoming(sender) {
    let cardId = sender.layout.cardInfo.id;
    let urlResolver = sender.layout.getService($UrlResolver)
    let requestManager = sender.layout.getService($RequestManager);

    sender.layout.params.cardSaved.subscribe(async (sndr, arg: ICancelableEventArgs<ILayoutSavedEventArgs>) => {
        arg.wait();
        let RegNum:Numerator = sndr.layout.controls.numeratorOfIncomingDocument;


        await RegNum.generateNewNumber(true, false);



        await createTrueDidgest(urlResolver, requestManager, cardId);

        arg.accept();
    })
}

export async function agreementListPayDocument(sender:AgreementList) {
    let cardId = layoutManager.cardLayout.getService($CardId);
    let urlResolver = sender.layout.getService($UrlResolver);
    let requestManager = sender.layout.getService($RequestManager);
    let agreementList = sender.layout.controls.agreementList;
    let RegNumTxt = sender.layout.controls.RegNumTxt;
    let dateOfRegistration = sender.layout.controls.RegDate;
    let holdingUnit = sender.layout.controls.HoldingUnit;
    let iniciator = sender.layout.controls.Registrar
    let partner = sender.layout.controls.PartnerCompany
    let DocName = sender.layout.controls.DocName

    layoutManager.cardLayout.controls.agreementList.params.agreementReportOpening.subscribe(async (handler, args) => {
            console.log(args.data.model.documentName)
        args.data.model.documentName = `Счет на оплату №${RegNumTxt.params.value} от
        ${moment(dateOfRegistration.params.value).format('L')} в ${holdingUnit.params.value.name} от ${partner.params.value.name} ${DocName.params.value}. Инициатор: ${iniciator.params.value.displayName} `

    });


    agreementList.params.agreementReportOpened.subscribe(async (handler, args) => {
        let contentControl = args.contentControl;
        let columns = contentControl.columns;
        columns[0].hidden = true
        columns[1].hidden = true;
        columns[2].hidden = true;
        columns[3].hidden = true;
        columns[4].hidden = true;
        columns[5].hidden = true;
        let index = args.contentControl.columns.indexOf(args.contentControl.commentColumn);
        args.contentControl.columns.splice(index, 1)

        columns.push({
            name: "ФИО согласующего",
            wieght: 1,
            value: (item) => item.fio,
            class: 'fio'
        },{
            name: "Дата начала",
            wieght: 1,
            value: (item) => item.beginDate,
            class: 'beginDate'
        },{
            name: "Дата завершения",
            wieght: 1,
            value: (item) => item.endDate,
            class: 'endDate'
        },{
            name: "Принятое решение",
            wieght: 1,
            value: (item) => item.decision,
            class: 'decision'
        },{
            name: "Комментарии",
            wieght: 1,
            value: (item) => item.comment,
            class: 'comments'
        });



        let receivedFromSererItems = await getAgreement(urlResolver, requestManager, cardId);
        let ObjectMas = receivedFromSererItems['items']

        args.model.items = ObjectMas.map(serverItem => (

            {

                fio: serverItem['fio'],
                beginDate:moment(serverItem['beginDate']).format('DD.MM.YYYY HH:mm'),
                endDate:moment(serverItem['endDate']).isValid() ? moment(serverItem['endDate']).format('DD.MM.YYYY HH:mm') : '',
                decision:serverItem['decision'],
                comment:serverItem['comment']

            }));


        args.contentControl.forceUpdate();
        console.log(columns)

    });
}


export async function ifPayIsFast(layout) {
    let Urgently = layout.controls.Urgently
    let agreementManagementStart = layout.controls.agreementManagementStart;
    if(Urgently.value == true){
        agreementManagementStart.params.visibility = false;
    }
}

