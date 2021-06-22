<?php

const SMTP_HOST = "hr2992636697.reseller.mis.ovh.net";
const SMTP_USER = "noreply@axeon.fr";
const SMTP_PASS = "xVqu887?";
const SMTP_PORT = 587;
const SMTP_ENCRYPT = 'tls';

//const SEND_COPY_TO = "support@axeon.fr";
const SEND_COPY_TO = null;

CONST MANDATORY_FIELDS = array( //FIXME
    "programName",
    "name",
    "lastName",
    "mail",
    "phone",
    "CP",
    "city",
    "action",
);