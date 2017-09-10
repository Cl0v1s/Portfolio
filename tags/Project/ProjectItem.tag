<app-projectitem>
    <div class="{ icon : true }"></div>
    <h2>{ project.name }</h2>
    <div class="img" style="background-image: url('{ project.images[0] }');">
        <div each="{ img in project.images }" style="background-image: url('{ img }');"></div>
    </div>
    <div class="content">
        <p class="resume">
            { project.resume }
        </p>
        <p class="description">
            { project.description }
        </p>
        <nav>
            <a href="{ project.link }" target="_blank">Consulter le lien du projet</a>
        </nav>
    </div>
    <script>
        var tag = this;

        tag.project = null;

        tag.on("before-mount", function(){
           tag.project = Adapter.adaptProject(tag.opts.project);
           if(tag.project == null)
               throw new Error("Project cant be null");
        });
    </script>
</app-projectitem>