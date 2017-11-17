  function init() {
    if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
      var $$ = go.GraphObject.make;  // for conciseness in defining templates          
    myDiagram =
      $$(go.Diagram, "myDiagramDiv",  // must name or refer to the DIV HTML element
        {
          initialContentAlignment: go.Spot.Center,
          allowDelete: false,
          allowCopy: false,
          layout: $$(go.ForceDirectedLayout,{
            arrangementSpacing:new go.Size(5,100),
            defaultGravitationalMass:1,
            epsilonDistance:5,
            randomNumberGenerator:{
                random:function(){
                  return .523;
                }
               }
          }),
          "undoManager.isEnabled": true
        });
        
    // define several shared Brushes
    var bluegrad = $$(go.Brush, "Linear", { 0: "rgb(150, 150, 250)", 0.5: "rgb(86, 86, 186)", 1: "rgb(86, 86, 186)" });
    var greengrad = $$(go.Brush, "Linear", { 0: "rgb(158, 209, 159)", 1: "rgb(67, 101, 56)" });
    var redgrad = $$(go.Brush, "Linear", { 0: "rgb(206, 106, 100)", 1: "rgb(180, 56, 50)" });
    var yellowgrad = $$(go.Brush, "Linear", { 0: "rgb(254, 221, 50)", 1: "rgb(254, 182, 50)" });
    var lightgrad = $$(go.Brush, "Linear", { 1: "#E6E6FA", 0: "#FFFAF0" });

    // the template for each attribute in a node's array of item data
    var itemTempl =
      $$(go.Panel, "Horizontal",
        $$(go.Shape,
          { desiredSize: new go.Size(10, 10) },
          new go.Binding("figure", "figure"),
          new go.Binding("fill", "color")),
        $$(go.TextBlock,
          {
            stroke: "#333333",
            font: "bold 14px sans-serif"
          },
          new go.Binding("text", "name"))
      );

    // define the Node template, representing an entity
    myDiagram.nodeTemplate =
      $$(go.Node, "Auto",  // the whole node panel
        {
          selectionAdorned: true,
          resizable: true,
          layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
          fromSpot: go.Spot.AllSides,
          toSpot: go.Spot.AllSides,
          isShadowed: true,
          shadowColor: "#C5C1AA",
          // when the user clicks on a Node, highlight all Links coming out of the node
        // and all of the Nodes at the other ends of those Links.
        click: function(e, node) { showConnections(node); }  // defined below
        },
        new go.Binding("location", "location").makeTwoWay(),
        // whenever the PanelExpanderButton changes the visible property of the "LIST" panel,
        // clear out any desiredSize set by the ResizingTool.
        new go.Binding("desiredSize", "visible", function (v) { return new go.Size(NaN, NaN); }).ofObject("LIST"),
        // define the node's outer shape, which will surround the Table
        $$(go.Shape, "Rectangle",
          { fill: lightgrad, stroke: "#756875", strokeWidth: 3 },
          new go.Binding("fill", "color"),
        // the Shape.stroke color depends on whether Node.isHighlighted is true
        new go.Binding("stroke", "isHighlighted", function(h) { return h ? "red" : "lightgray"; })
            .ofObject(),
          ),
        $$(go.Panel, "Table",
          { margin: 8, stretch: go.GraphObject.Fill },
          $$(go.RowColumnDefinition, { row: 0, sizing: go.RowColumnDefinition.None }),
          // the table header
          $$(go.TextBlock,
            {
              row: 0, alignment: go.Spot.Center,
              margin: new go.Margin(0, 14, 0, 2),  // leave room for Button
              font: "bold 16px sans-serif"
            },
            new go.Binding("text", "key")),
          // the collapse/expand button
          $$("PanelExpanderButton", "LIST",  // the name of the element whose visibility this button toggles
            { row: 0, alignment: go.Spot.TopRight }),
          // the list of Panels, each showing an attribute
          $$(go.Panel, "Vertical",
            {
              name: "LIST",
              row: 1,
              padding: 3,
              alignment: go.Spot.TopLeft,
              defaultAlignment: go.Spot.Left,
              stretch: go.GraphObject.Horizontal,
              itemTemplate: itemTempl
            },
            new go.Binding("itemArray", "items"))
        )  // end Table Panel
      );  // end Node

    // define the Link template, representing a relationship
    myDiagram.linkTemplate =
      $$(go.Link,  // the whole link panel
        {
          selectionAdorned: true,
          layerName: "Foreground",
          reshapable: true,
          routing: go.Link.AvoidsNodes,
          corner: 5,
          curve: go.Link.JumpOver
        },
        $$(go.Shape,  // the link shape
          { stroke: "#303B45", strokeWidth: 2.5 },
          // the Shape.stroke color depends on whether Link.isHighlighted is true
        new go.Binding("stroke", "isHighlighted", function(h) { return h ? "red" : "lightgray"; })
            .ofObject()
            ),
        $$(go.TextBlock,  // the "from" label
          {
            textAlign: "center",
            font: "bold 14px sans-serif",
            stroke: "#1967B3",
            segmentIndex: 0,
            segmentOffset: new go.Point(NaN, NaN),
            segmentOrientation: go.Link.OrientUpright
          },
          new go.Binding("text", "text")),
        $$(go.TextBlock,  // the "to" label
          {
            textAlign: "center",
            font: "bold 14px sans-serif",
            stroke: "#1967B3",
            segmentIndex: -1,
            segmentOffset: new go.Point(NaN, NaN),
            segmentOrientation: go.Link.OrientUpright
          },
          new go.Binding("text", "toText"))
      );


    // create the model for the E-R diagram
    var updatedNodeArray = [];

      window.nodes.forEach(function (n) {        
        //  window.attributeDetails.forEach(function (row) {        
        //     if (row.entity_type_id == selectedNode.id) {
        //         attrbody += '<tr><td class="col-md-2">' + row.display_name + '</td><td class="col-md-1">'
        //             + row.data_type + '</td><td class="col-md-1">' + row.primary_attribute + '</td><td class="col-md-1">'
        //             + row.is_unique + '</td><td class="col-md-1">' + row.is_nullable + '</td><td class="col-md-2">'
        //             + row.default_value + '</td><td class="col-md-2">' + row.entity_display_name + '</td><td class="col-md-2">'
        //             + row.parent_entity_attribute_name + '</td></tr>'
        //     }
        // });   
        debugger;
        var obj;
        if(n.Label == "Fund - Test") 
        {
          debugger;
          obj={
          key: n.Label,          
          id:n.Id,
          items: [ { name: "Fund Mnemonic", iskey: true, figure: "Decision", color: yellowgrad },                          
                          { name: "Fed Share Class", iskey: false, figure: "Decision", color: "purple" },                                                  
                          { name: "Fund Group", iskey: false, figure: "Decision", color: "purple" },
                          { name: "Fund Company", iskey: false, figure: "Decision", color: "purple" } ]
        }
        debugger;
      }
      else{
         obj={
          key: n.Label,
          id:n.Id,
          items: [ { name: n.Label+"ID", iskey: true, figure: "Decision", color: yellowgrad },                          
                 ]
        } 
      }

        
        updatedNodeArray.push(obj);
    });
    myDiagram.addDiagramListener("ObjectSingleClicked",function(e){
      if(e.subject.part instanceof go.Node ){                
       $('#tblAttributeDetails').DataTable().destroy();
       $('#tblRuleDetails').DataTable().destroy();
      
        var selectedNode;        
        updatedNodeArray.forEach(function (n) {          
            if (n.key == e.subject.part.data.key) {
                selectedNode = n;
            }
        });
         myDiagram.click = function(e) {
    myDiagram.startTransaction("no highlighteds");
    myDiagram.clearHighlighteds();
    myDiagram.commitTransaction("no highlighteds");
  };

        $('.node-details').css('display', 'block');
        $('#nodeName h4').text(selectedNode.key);
        var attrbody = '';      
        $('.node-details-content #AttributeDetails tbody tr').remove();
        
        window.attributeDetails.forEach(function (row) {        
            if (row.entity_type_id == selectedNode.id) {
                attrbody += '<tr><td class="col-md-2">' + row.display_name + '</td><td class="col-md-1">'
                    + row.data_type + '</td><td class="col-md-1">' + row.primary_attribute + '</td><td class="col-md-1">'
                    + row.is_unique + '</td><td class="col-md-1">' + row.is_nullable + '</td><td class="col-md-2">'
                    + row.default_value + '</td><td class="col-md-2">' + row.entity_display_name + '</td><td class="col-md-2">'
                    + row.parent_entity_attribute_name + '</td></tr>'
            }
        });        
       $('.node-details-content #AttributeDetails tbody').append(attrbody);
        $('#tblAttributeDetails').DataTable({
            "scrollY": "180px",
            "scrollCollaspe": true,
            "dom": 't',
        });
        var rulebody = '';
    
        $('.node-details-content #RuleDetails tbody tr').remove();
        
        window.ruleDetails.forEach(function (row) {
            if (row.entity_type_id == selectedNode.id.toString()) {
              
                rulebody += '<tr><td class="col-md-2">' + row.attribute_name + '</td><td class="col-md-2">'
                    + row.rule_name + '</td><td class="col-md-1">' + row.rule_type + '</td><td class="col-md-6">'
                    + row.rule_text + '</td><td class="col-md-1">'
                    + row.priority + '</td"></tr>'
            }
        });

        $('.node-details-content #RuleDetails tbody').append(rulebody);
        $('#tblRuleDetails').DataTable({
            "scrollY": "180px",
            "scrollCollaspe": true,
            "dom": 't',
        });

        $('.dataTables_scrollHeadInner,.dataTables_scrollHeadInner table').width('100%');
            
        }
      });

      $('#closeNodeDetails').on('click', function () {
          $('.node-details').css('display', 'none');
      });
       

    var updatedLinkDataArray = [];

  window.edges.forEach(function (e) {
          var toFound=0,fromFound=0;            
          updatedNodeArray.forEach(function (n){              
            if(e.To == n.key)
            {
              toFound=1;                            
            }            
          })

          updatedNodeArray.forEach(function (n){
            if(e.From == n.key)
            {
              fromFound=1;
            }            
          })
    
          if(toFound==1 && fromFound ==1)
          {
    
              updatedLinkDataArray.push({
              from: e.From,
              to: e.To,
              text: e.FromArrow == "dash" ? "1" : "1",
              toText: e.ToArrow == "arrow" ? "N" : "1"
              })
          }
          
    })
    console.log(updatedLinkDataArray);     
    myDiagram.model = new go.GraphLinksModel(updatedNodeArray, updatedLinkDataArray);

     // highlight all Links and Nodes coming out of a given Node
  function showConnections(node) {
    var diagram = node.diagram;
    diagram.startTransaction("highlight");
    // remove any previous highlighting
    diagram.clearHighlighteds();
    // for each Link coming out of the Node, set Link.isHighlighted
    debugger;
    node.findLinksOutOf().each(function(l) { l.isHighlighted = true; });
    node.findLinksInto().each(function(l) { l.isHighlighted = true; });    
    // for each Node destination for the Node, set Node.isHighlighted
    node.findNodesOutOf().each(function(n) { n.isHighlighted = true; });
    node.findNodesInto().each(function(n) { n.isHighlighted = true; });
    
    diagram.commitTransaction("highlight");
  }
  }