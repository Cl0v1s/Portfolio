<app-projects id="top">

    <app-projectitem each="{ project in projects }" project="{ project }"></app-projectitem>

    <script>
        var tag = this;

        tag.projects = null;

        tag.on("before-mount", function()
        {
            tag.projects = tag.opts.projects;
            if(tag.projects == null)
                throw new Error("Projects cant be null.");
        });
    </script>
</app-projects>