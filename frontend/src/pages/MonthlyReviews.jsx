import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

import {
  Loader2,
  Plus,
  RefreshCcw,
  Edit3,
  Trash2,
  CheckCircle2,
  ListChecks,
  Clock,
  AlertCircle,
  TrendingUp,
  Layers,
  Infinity as InfinityIcon
} from 'lucide-react';

import api from '../services/api';

import TaskModal from '../components/TaskModal';
import TemplateModal from '../components/TemplateModal';



const ROLES = [
  "Project & Strategy Director",
  "Strategic Planning Director",
  "Operations & Audit Director",
  "Social Media & Content Manager",
  "AI Research & Development Specialist"
];


const STATUSES = [
  'Pending',
  'In Progress',
  'Completed'
];



function currentMonthStr() {

  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

}



function formatMonthLabel(monthStr){

  const [
    y,
    m
  ] = monthStr.split('-').map(Number);


  const d = new Date(
    y,
    m-1,
    1
  );


  return d.toLocaleDateString(
    undefined,
    {
      month:'long',
      year:'numeric'
    }
  );

}





const MonthlyReviews = ()=>{


  const {
    projectId
  } = useParams();



  const [tasks,setTasks] = useState([]);

  const [templates,setTemplates] = useState([]);

  const [members,setMembers] = useState([]);


  const [loading,setLoading] = useState(true);

  const [generating,setGenerating] = useState(false);



  const [
    selectedMonth,
    setSelectedMonth
  ] = useState(
    currentMonthStr()
  );



  const [
    isTaskModalOpen,
    setIsTaskModalOpen
  ] = useState(false);



  const [
    editingTask,
    setEditingTask
  ] = useState(null);




  const [
    isTemplateModalOpen,
    setIsTemplateModalOpen
  ] = useState(false);



  const [
    templateModalMode,
    setTemplateModalMode
  ] = useState('create');



  const [
    editingTemplate,
    setEditingTemplate
  ] = useState(null);








  const fetchData = async()=>{


    try{


      setLoading(true);



      const [
        tasksRes,
        templatesRes,
        membersRes
      ] = await Promise.all([


        api.get(
          `/projects/${projectId}/tasks`
        ),


        api.get(
          `/projects/${projectId}/templates`
        ),


        api.get(
          `/projects/${projectId}/users`
        )


      ]);



      setTasks(tasksRes.data);

      setTemplates(templatesRes.data);

      setMembers(membersRes.data);



    }
    catch(error){


      console.error(
        "Failed to fetch monthly review data",
        error
      );


    }
    finally{


      setLoading(false);


    }


  };







  useEffect(()=>{


    if(projectId){

      fetchData();

    }


  },[projectId]);








  const getAssignedMember = (task)=>{


    if(!task.assignedTo)
      return null;



    if(typeof task.assignedTo === 'object')
      return task.assignedTo;



    return members.find(
      m=>m._id===task.assignedTo
    ) || null;


  };

    const monthsWithTasks = Array.from(
    new Set(
      tasks
        .map(t => t.month)
        .filter(Boolean)
    )
  );


  if (!monthsWithTasks.includes(currentMonthStr())) {
    monthsWithTasks.push(currentMonthStr());
  }


  const sortedMonths = monthsWithTasks.sort(
    (a,b)=>b.localeCompare(a)
  );



  const monthTasks = tasks.filter(
    t => t.month === selectedMonth
  );



  const totalCount = monthTasks.length;


  const completedCount =
    monthTasks.filter(
      t=>t.status==="Completed"
    ).length;


  const inProgressCount =
    monthTasks.filter(
      t=>t.status==="In Progress"
    ).length;


  const pendingCount =
    monthTasks.filter(
      t=>t.status==="Pending"
    ).length;



  const percentComplete =
    totalCount > 0
    ?
    Math.round(
      (completedCount / totalCount) * 100
    )
    :
    0;







  // Generate monthly tasks from templates
  const handleStartNewMonth = async()=>{


    if(templates.length===0){

      alert(
        "You don't have any recurring task templates yet. Add some below first."
      );

      return;

    }



    if(
      !window.confirm(
        `Generate this month's recurring tasks from ${templates.length} template(s)?`
      )
    )
      return;




    try{


      setGenerating(true);



      const res = await api.post(

        `/projects/${projectId}/templates/generate`,

        {
          month: currentMonthStr()
        }

      );



      alert(
        `Done! Created ${res.data.created} task(s). Skipped ${res.data.skipped} (already existed this month).`
      );



      setSelectedMonth(
        currentMonthStr()
      );



      fetchData();



    }
    catch(error){


      alert(
        "Failed to generate monthly tasks."
      );


      console.error(error);


    }
    finally{


      setGenerating(false);


    }


  };








  // Open task edit modal
  const handleOpenEditTask = (task)=>{


    setEditingTask(task);

    setIsTaskModalOpen(true);


  };







  // Save edited task
  const handleSaveTask = async(taskData)=>{


    try{


      const res = await api.put(

        `/projects/${projectId}/tasks/${editingTask._id}`,

        taskData

      );



      setTasks(

        tasks.map(t=>

          t._id === editingTask._id

          ?
          res.data

          :
          t

        )

      );



      setIsTaskModalOpen(false);



    }
    catch(error){


      alert(
        "Failed to save task."
      );


      console.error(error);


    }


  };








  // Toggle task status
  const toggleTaskStatus = async(task)=>{


    const currentIndex =
      STATUSES.indexOf(
        task.status
      );



    const nextStatus =
      STATUSES[
        (currentIndex + 1)
        %
        STATUSES.length
      ];



    try{


      await api.put(

        `/projects/${projectId}/tasks/${task._id}`,

        {
          status: nextStatus
        }

      );



      setTasks(

        tasks.map(t=>

          t._id === task._id

          ?
          {
            ...t,
            status: nextStatus
          }

          :
          t

        )

      );



    }
    catch(error){


      console.error(
        "Failed to update status",
        error
      );


    }


  };








  // Delete task
  const handleDeleteTask = async(id)=>{


    if(
      !window.confirm(
        "Delete this task?"
      )
    )
      return;



    try{


      await api.delete(

        `/projects/${projectId}/tasks/${id}`

      );



      setTasks(

        tasks.filter(
          t=>t._id!==id
        )

      );



    }
    catch(error){


      console.error(
        "Failed to delete task",
        error
      );


    }


  };








  // Open create template modal
  const handleOpenCreateTemplate = ()=>{


    setTemplateModalMode(
      'create'
    );


    setEditingTemplate(null);


    setIsTemplateModalOpen(true);


  };








  // Open edit template modal
  const handleOpenEditTemplate = (template)=>{


    setTemplateModalMode(
      'edit'
    );


    setEditingTemplate(template);


    setIsTemplateModalOpen(true);


  };








  // Create / Update template
  const handleSaveTemplate = async(templateData)=>{


    try{


      if(
        templateModalMode === 'edit'
        &&
        editingTemplate
      ){



        const res = await api.put(

          `/projects/${projectId}/templates/${editingTemplate._id}`,

          templateData

        );



        setTemplates(

          templates.map(t=>

            t._id === editingTemplate._id

            ?
            res.data

            :
            t

          )

        );



      }
      else{



        const res = await api.post(

          `/projects/${projectId}/templates`,

          templateData

        );



        setTemplates(

          [
            res.data,
            ...templates
          ]

        );



      }



      setIsTemplateModalOpen(false);



    }
    catch(error){


      alert(
        "Failed to save template."
      );


      console.error(error);


    }


  };








  // Delete template
  const handleDeleteTemplate = async(id)=>{


    if(
      !window.confirm(
        "Delete this recurring task template? This won't affect tasks already created from it."
      )
    )
      return;




    try{


      await api.delete(

        `/projects/${projectId}/templates/${id}`

      );



      setTemplates(

        templates.filter(
          t=>t._id!==id
        )

      );



    }
    catch(error){


      console.error(
        "Failed to delete template",
        error
      );


    }


  };

    if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-red-600" />
          <p className="text-slate-500 font-medium">
            Loading monthly reviews...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Monthly Reviews
          </h1>
          <p className="text-slate-500">
            Manage recurring campaign tasks and monthly progress.
          </p>
        </div>

        <button
          onClick={handleStartNewMonth}
          disabled={generating}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCcw className="w-4 h-4" />
          )}

          {generating ? "Generating..." : "Start New Month"}
        </button>
      </div>


      {/* Month Selector */}
      <Card className="p-4 flex items-center gap-3">

        <Layers className="w-4 h-4 text-slate-400"/>

        <span className="text-sm font-semibold">
          Month
        </span>

        <select
          value={selectedMonth}
          onChange={(e)=>setSelectedMonth(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          {sortedMonths.map(month=>(
            <option key={month} value={month}>
              {formatMonthLabel(month)}
            </option>
          ))}
        </select>

      </Card>


      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

        {[
          {
            title:"Total Tasks",
            value:totalCount,
            icon:ListChecks
          },
          {
            title:"Completed",
            value:completedCount,
            icon:CheckCircle2
          },
          {
            title:"In Progress",
            value:inProgressCount,
            icon:Clock
          },
          {
            title:"Pending",
            value:pendingCount,
            icon:AlertCircle
          },
          {
            title:"Complete",
            value:`${percentComplete}%`,
            icon:TrendingUp
          }

        ].map((item,index)=>(
          <Card key={index} className="p-5">

            <div className="flex justify-between">

              <span className="text-xs uppercase text-slate-500">
                {item.title}
              </span>

              <item.icon className="w-5 h-5 text-red-600"/>

            </div>

            <div className="text-2xl font-bold mt-3">
              {item.value}
            </div>

          </Card>
        ))}

      </div>



      {/* Monthly Tasks Table */}

      <Card>

        <div className="p-4 border-b">

          <h2 className="font-bold">
            {formatMonthLabel(selectedMonth)} Tasks
          </h2>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-slate-100">

              <tr>

                <th className="p-4 text-left">
                  Task
                </th>

                <th>
                  Assigned
                </th>

                <th>
                  Status
                </th>

                <th>
                  Priority
                </th>

                <th>
                  Due Date
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>


            {
              monthTasks.map(task=>{

                const member=getAssignedMember(task);


                return (

                <tr
                  key={task._id}
                  className="border-b hover:bg-slate-50"
                >

                  <td className="p-4">

                    <div className="font-semibold">
                      {task.title}
                    </div>

                    <div className="text-xs text-slate-400">
                      {task.phase}
                    </div>

                  </td>


                  <td>

                    {
                      member
                      ?
                      member.name
                      :
                      "Unassigned"
                    }

                  </td>


                  <td>

                    <button
                      onClick={()=>toggleTaskStatus(task)}
                    >

                    <Badge
                      variant="status"
                      type={task.status}
                    />

                    </button>

                  </td>



                  <td>

                    <Badge
                      variant="priority"
                      type={task.priority}
                    />

                  </td>



                  <td>

                  {
                    task.dueDate
                    ?
                    new Date(task.dueDate)
                    .toLocaleDateString()
                    :
                    <span className="text-blue-500 flex gap-1">
                      <InfinityIcon className="w-4 h-4"/>
                      Ongoing
                    </span>

                  }

                  </td>



                  <td>

                    <div className="flex gap-2">


                    <button
                      onClick={()=>handleOpenEditTask(task)}
                      className="text-blue-600"
                    >
                      <Edit3 size={16}/>
                    </button>



                    <button
                      onClick={()=>handleDeleteTask(task._id)}
                      className="text-red-600"
                    >
                      <Trash2 size={16}/>
                    </button>


                    </div>


                  </td>



                </tr>

                )

              })
            }


            </tbody>


          </table>


        </div>


      </Card>




      {/* Templates */}

      <Card className="p-6">


        <div className="flex justify-between mb-5">

          <div>

          <h2 className="font-bold text-lg">
            Recurring Task Templates
          </h2>

          <p className="text-sm text-slate-500">
            Templates are used when generating monthly tasks.
          </p>

          </div>


          <button
            onClick={handleOpenCreateTemplate}
            className="bg-red-600 text-white px-3 py-2 rounded-lg flex gap-2"
          >

            <Plus size={16}/>
            New Template

          </button>


        </div>



        <div className="grid md:grid-cols-2 gap-4">


        {
          templates.map(template=>(

          <div
            key={template._id}
            className="border rounded-lg p-4"
          >

            <div className="flex justify-between">


              <h3 className="font-bold">
                {template.title}
              </h3>


              <div className="flex gap-2">

              <button
                onClick={()=>handleOpenEditTemplate(template)}
              >
                <Edit3 size={15}/>
              </button>


              <button
                onClick={()=>handleDeleteTemplate(template._id)}
              >
                <Trash2 size={15}/>
              </button>


              </div>


            </div>



            <div className="text-xs mt-2 text-slate-500">

              {template.phase}

              {" • "}

              {template.priority}

            </div>


          </div>

          ))
        }


        </div>


      </Card>




      {/* Modals */}


      <TaskModal

        isOpen={isTaskModalOpen}

        onClose={()=>
          setIsTaskModalOpen(false)
        }

        onSave={handleSaveTask}

        mode="edit"

        initialData={editingTask}

        teamMembers={members}

      />




      <TemplateModal

        isOpen={isTemplateModalOpen}

        onClose={()=>
          setIsTemplateModalOpen(false)
        }

        onSave={handleSaveTemplate}

        mode={templateModalMode}

        initialData={editingTemplate}

        roles={ROLES}

      />


    </div>
  );
};


export default MonthlyReviews;