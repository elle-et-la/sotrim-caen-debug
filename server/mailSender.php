<?php
require_once("settings.php");
require_once("phpMailer/Exception.php");
require_once("phpMailer/PHPMailer.php");
require_once("phpMailer/SMTP.php");

use PHPMailer\PHPMailer\PHPMailer;

$result = array("status" => "ok", "msg" => "");

$postdata = file_get_contents("php://input");

if ($postdata) {
    try {
        $data = (gettype($postdata) === "string") ? json_decode($postdata, true) : $postdata;
        if (checkDataValidity($data)) {
            $mail = new PHPMailer(true);
            $mail->SMTPDebug = 0;
            $mail->isSMTP();
            $mail->Host = SMTP_HOST;
            $mail->SMTPAuth = true;
            $mail->Username = SMTP_USER;
            $mail->Password = SMTP_PASS;
            $mail->SMTPSecure = SMTP_ENCRYPT;
            $mail->SMTPOptions  = array('verify_peer' => false, 'verify_peer_name' => false, 'allow_self_signed' => true);
            $mail->Port = SMTP_PORT;
            $mail->CharSet = 'UTF-8';

            $mail->setFrom(SMTP_USER);
            $mail->addAddress(MAIL_RECEIVER);
            if (SEND_COPY_TO) {
                $mail->addCC(SEND_COPY_TO);
            }

            $message = "<table>";
            $message .= addMessageContent("Programme", "residence", $data);
            $message .= addMessageContent("Civilité", "civility", $data);
            $message .= addMessageContent("Nom", "firstname", $data);
            $message .= addMessageContent("Prénom", "lastname", $data);
            $message .= addMessageContent("Email", "email", $data);
            $message .= addMessageContent("Téléphone", "phone", $data);
           // $message .= addMessageContent("Adresse", "address", $data);
            $message .= addMessageContent("Code Postal", "cp", $data);
            $message .= addMessageContent("Ville", "city", $data);
            
            $message .= addMessageContent("Lot", "lot", $data);
            $message .= addMessageContent("Projet", "project", $data);
            $message .= addMessageContent("Type recherché", "surface", $data);

            /*$message .= addMessageContent("Destination", "dest", $data);
            $message .= addMessageContent("Budget", "budj", $data);
            $message .= addMessageContent("Action", "action", $data);
            $message .= addMessageContent("utm_source", "utm_source", $data);
            $message .= addMessageContent("utm_medium", "utm_medium", $data);
            $message .= addMessageContent("utm_campaign", "utm_campaign", $data);
            $message .= addMessageContent("RGPD", "RGPD", $data);
            $message .= addMessageContent("Date", "date", $data);
            $message .= addMessageContent("Commentaire", "comm", $data);*/
            $message .= "</table>";

            //Content
            $mail->isHTML(true);
            $mail->Subject = 'Contact ' . $data['programName'];
            $mail->Body    = $message;

            $mail->send();

            $result['msg'] = 'MAIL_SEND';
            echo json_encode($result, JSON_UNESCAPED_SLASHES);
        }
    } catch (Exception $e) {
        sendError($e->getMessage());
    }
} else {
    sendError("FORM_EMPTY");
}

function checkDataValidity($data)
{
    $isValid = true;
    foreach (MANDATORY_FIELDS as $mf) {
        if (!isset($data[$mf])) {
            $isValid = false;
        }
    }
    if (!$isValid) {
        sendError("FORM_NOT_COMPLETE " . json_encode($data));
    }
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $isValid = false;
        sendError("EMAIL_NOT_VALID");
    }
    if (!preg_match("/^0[0-9]{9}$/", $data['phone'])) {
        $isValid = false;
        sendError("PHONE_NOT_VALID");
    }
    if (!preg_match("~^[0-9]{5}$~", $data['cp'])) {
        $isValid = false;
        sendError("CODE_POSTAL_NOT_VALID");
    }
    return $isValid;
}

function addMessageContent($label, $key, $data)
{
    $value = (isset($data[$key])) ? $data[$key] : "---";
    if (gettype($value) === "boolean") {
        $value = $value ? "OUI" : "NON";
    }
    return "<tr><td>" . $label . ":</td><td>" . $value . "</td></tr>";
}

function sendError($msg, $exit = true)
{
    $result["status"] = "error";
    $result["msg"] = $msg;
    echo json_encode($result, JSON_UNESCAPED_SLASHES);
    if ($exit) {
        die();
    }
}
