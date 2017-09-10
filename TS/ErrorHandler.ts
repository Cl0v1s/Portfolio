class ErrorHandler
{
    public static State = {
        INFO : "INFO", 
        ERROR : "ERROR",
        FATAL : "FATAL"
    }

    private static Instance : ErrorHandler = new ErrorHandler();

    public static GetInstance() : ErrorHandler
    {
        return ErrorHandler.Instance;
    }

    public handle(response) : void
    {
        if(response.state == "OK")
            return;
        var error = new Error();
        switch(response.data)
        {
            case 0:
                error.message = "Vos informations de connexion ne sont pas valides.";
                error.name = ErrorHandler.State.FATAL;
            break;
            case 1:
                error.message = "Vous n'avez pas les droits suffisants."
                error.name = ErrorHandler.State.FATAL;
            break;
            case "23000":
            case 23000:
                error = this.handleSQL(response);
            break;
            case "105":
            case 105:
                error.message = "Une valeur requise est manquante. Veuillez vérifier le formulaire.";
                error.name = ErrorHandler.State.ERROR;
            break;
            case 101:
                var length = response.message.split(" than ")[1].split("\n\n#0")[0];
                error.message = "Une valeur est en dessous de la longueur requise de "+length+" caractères. Veuillez vérifier le formulaire.";
                error.name = ErrorHandler.State.ERROR;
            break;
            default:
                error.name = ErrorHandler.State.ERROR;
                error.message = "Ooops... Quelque chose s'est mal passé. Veuillez réessayer plus tard.";
            break;
        }
        throw error;
    }

    private handleSQL(response) : Error
    {
        var error = new Error();
        // gestion de l'unicité 
        if(response.message.indexOf(" 1062 ") != -1)
        {
            var value = response.message.split("Duplicate entry '")[1].split("' for key ")[0];
            error.message = "La valeur "+value+" transmise existe déjà dans la base de données. Veuillez corriger le formulaire.";
            error.name= ErrorHandler.State.ERROR;
        }
        return error;
    }

    public static alertIfError(error : any) : void 
    {
        if(error instanceof Error)
            vex.dialog.alert(error.message);
    }
}