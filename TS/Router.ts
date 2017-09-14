/**
 * Created by clovis on 11/08/17.
 */
var route = <any>require("riot-route");

class Router
{
    private static Instance : Router = new Router();

    public static GetInstance() : Router
    {
        return Router.Instance;
    }

    public static Redirect(link : string)
    {
        route(link);
    }

    constructor()
    {
        this.setRoutes();
    }

    public start() : void
    {
        this.home();
        //route.start(true);
    }

    /////////////////////////////////////////////////////////////////

    public home()
    {
        let request = App.request("/static/data/projects.json", null);
        request.then((response : any) => {
            App.changePage("app-home", {
                "projects" : response.projects
            });
        });
        request.catch((error) => {
           ErrorHandler.alertIfError(error);
        });
    }



    ///////////////////////////////////////////////////////////////

    private setRoutes() : void
    {
        route('', this.home);

        route("index", this.home);
    }
}