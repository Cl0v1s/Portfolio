class Adapter
{
    public static adaptProject(project : any) : any
    {
        if(project.adapted)
            return project;
        project.adapted = true;

        project.resume = project.description.substr(0,200)+"...";

        return project;
    }
}