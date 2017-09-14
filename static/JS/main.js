class Adapter {
    static adaptProject(project) {
        if (project.adapted)
            return project;
        project.adapted = true;
        project.resume = project.description.substr(0, 100) + "...";
        return project;
    }
}
class ErrorHandler {
    static GetInstance() {
        return ErrorHandler.Instance;
    }
    handle(response) {
        if (response.state == "OK")
            return;
        var error = new Error();
        switch (response.data) {
            case 0:
                error.message = "Vos informations de connexion ne sont pas valides.";
                error.name = ErrorHandler.State.FATAL;
                break;
            case 1:
                error.message = "Vous n'avez pas les droits suffisants.";
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
                error.message = "Une valeur est en dessous de la longueur requise de " + length + " caractères. Veuillez vérifier le formulaire.";
                error.name = ErrorHandler.State.ERROR;
                break;
            default:
                error.name = ErrorHandler.State.ERROR;
                error.message = "Ooops... Quelque chose s'est mal passé. Veuillez réessayer plus tard.";
                break;
        }
        throw error;
    }
    handleSQL(response) {
        var error = new Error();
        // gestion de l'unicité 
        if (response.message.indexOf(" 1062 ") != -1) {
            var value = response.message.split("Duplicate entry '")[1].split("' for key ")[0];
            error.message = "La valeur " + value + " transmise existe déjà dans la base de données. Veuillez corriger le formulaire.";
            error.name = ErrorHandler.State.ERROR;
        }
        return error;
    }
    static alertIfError(error) {
        if (error instanceof Error)
            vex.dialog.alert(error.message);
    }
}
ErrorHandler.State = {
    INFO: "INFO",
    ERROR: "ERROR",
    FATAL: "FATAL"
};
ErrorHandler.Instance = new ErrorHandler();
/**
 * Created by clovis on 11/08/17.
 */
var route = require("riot-route");
class Router {
    constructor() {
        this.setRoutes();
    }
    static GetInstance() {
        return Router.Instance;
    }
    static Redirect(link) {
        route(link);
    }
    start() {
        this.home();
        //route.start(true);
    }
    /////////////////////////////////////////////////////////////////
    home() {
        let request = App.request("/static/data/projects.json", null);
        request.then((response) => {
            App.changePage("app-home", {
                "projects": response.projects
            });
        });
        request.catch((error) => {
            ErrorHandler.alertIfError(error);
        });
    }
    ///////////////////////////////////////////////////////////////
    setRoutes() {
        route('', this.home);
        route("index", this.home);
    }
}
Router.Instance = new Router();
var riot = require("riot");
var ajax = require("ajax-promise");
require("./../../tags/Home.tag");
require("./../../tags/Header.tag");
require("./../../tags/Footer.tag");
require("./../../tags/Project/Project.tag");
require("./../../tags/Project/Projects.tag");
require("./../../tags/Project/ProjectItem.tag");
class App {
    static diagnosticForm(formname, errors) {
        for (var field in errors[formname]) {
            var nodes = document.getElementsByName(field);
            if (nodes.length <= 0)
                continue;
            var node = (nodes[0]);
            node.classList.add("error");
            node.addEventListener("focus", function (e) {
                e.target.classList.remove("error");
            });
            node.addEventListener("click", function (e) {
                e.target.classList.remove("error");
            });
        }
    }
    static request(address, data, redirect = true) {
        return new Promise(function (resolve, reject) {
            var href = window.location.href;
            if (data == null)
                data = {};
            var request = ajax.post(address, data);
            App.showLoading();
            request.then(function (response) {
                App.hideLoading();
                if (App.checkPage(href) == false) {
                    reject(ErrorHandler.State.FATAL);
                    return;
                }
                if (address.indexOf(App.Address) == -1) {
                    resolve(response);
                    return;
                }
                try {
                    ErrorHandler.GetInstance().handle(response);
                    resolve(response);
                }
                catch (error) {
                    if (error.name == ErrorHandler.State.FATAL) {
                        if (redirect) {
                            var message = encodeURI(error.message);
                            reject(ErrorHandler.State.FATAL);
                            route("/error/" + message);
                            console.error(error.message);
                        }
                        else {
                            ErrorHandler.alertIfError(error);
                        }
                    }
                    else
                        reject(error);
                }
            });
            request.catch(function (error) {
                App.hideLoading();
                if (App.checkPage(href) == false) {
                    reject(ErrorHandler.State.FATAL);
                    return;
                }
                var message = encodeURI("Une erreur réseau a eu lieu. Vérifiez votre connexion et réessayez.");
                reject(ErrorHandler.State.FATAL);
                route("/error/" + message);
            });
        });
    }
    static checkPage(page) {
        if (window.location.href != page)
            return false;
        return true;
    }
    static changePage(tag, data) {
        if (App.Page != null) {
            App.Page.forEach(function (t) {
                t.unmount();
            });
            var e = document.createElement("div");
            e.id = "app";
            document.body.appendChild(e);
        }
        App.hideLoading();
        App.Page = riot.mount("div#app", tag, data);
    }
    static showPopUp(tag, title, data) {
        if (App.PopUp != null) {
            App.PopUp.forEach(function (t) {
                t.unmount();
            });
            if (document.querySelector("div#popup") != null)
                document.querySelector("div#popup").remove();
        }
        var hide = document.createElement("div");
        hide.id = "hidder";
        hide.addEventListener("click", App.hidePopUp);
        document.body.appendChild(hide);
        var e = document.createElement("div");
        e.id = "popup";
        e.setAttribute("data-name", title);
        var d = document.createElement("div");
        e.appendChild(d);
        var close = document.createElement("div");
        close.className = "close";
        close.innerHTML = "🞩";
        e.appendChild(close);
        close.addEventListener("click", App.hidePopUp);
        document.body.appendChild(e);
        App.PopUp = riot.mount(d, tag, data);
        return App.PopUp;
    }
    static hidePopUp() {
        if (App.PopUp != null) {
            App.PopUp.forEach(function (t) {
                t.unmount();
            });
            if (document.querySelector("div#popup") != null)
                document.querySelector("div#popup").remove();
            if (document.querySelector("div#hidder") != null)
                document.querySelector("div#hidder").remove();
        }
    }
    static showLoading() {
        App.LoadingCounter++;
        if (document.getElementById("loading") != null)
            return;
        var e = document.createElement("div");
        e.id = "loading";
        document.body.appendChild(e);
    }
    static hideLoading() {
        App.LoadingCounter--;
        if (App.LoadingCounter > 0)
            return;
        var e = document.getElementById("loading");
        if (e == null)
            return;
        e.remove();
        App.LoadingCounter = 0;
    }
}
App.Address = "http://localhost:8080/API";
App.Page = null;
App.PopUp = null;
App.LoadingCounter = 0;
window.addEventListener("load", function () {
    Router.GetInstance().start();
});
/// <reference path="Router.ts" />
/// <reference path="Global.ts" />
/// <reference path="Adapter.ts" />
window.Router = Router;
window.App = App;
window.Adapter = Adapter;
window.ErrorHandler = ErrorHandler;
//# sourceMappingURL=main.js.map