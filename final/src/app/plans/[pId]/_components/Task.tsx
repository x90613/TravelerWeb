import React, { useState } from 'react';
// import TaskDialog from './JourneyDialog';

export type TaskProps = {
  title: string;
  start: string;
  end: string;
  location: string;
  note: string;
}

export default function Task({ title, start, end, location, note }: TaskProps){
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  }

  const handleDelete = async() => {
    console.log('Delete button clicked');
  }

  return (
    <>
        <button className="relative border-2 m-4 p-4 w-1/2 rounded-lg" onClick={handleClickOpen}>
          <div className="flex justify-between items-start">
            <div className="flex">
              <div className="font-bold m-1 p-1">Title</div>
              <div className="border m-1 p-1 rounded-lg">{title}</div>
            </div>
            <button
              onClick={handleDelete}
              className="text-white bg-red-500 hover:bg-red-700 rounded-full w-6 h-6 flex items-center justify-center"
            >
              X
            </button>
          </div>
          <div className="flex justify-even w-full">
            <div className="flex">
              <div className="font-bold m-1 p-1">Start</div>
              <div className="border m-1 p-1 rounded-lg">{start}</div>
            </div>
            <div className="flex">
              <div className="font-bold m-1 p-1">End</div>
              <div className="border m-1 p-1 rounded-lg">{end}</div>
            </div>
          </div>
          <div className="flex">
            <div className="font-bold m-1 p-1">Location</div>
            <div className="border m-1 p-1 rounded-lg">{location}</div>
          </div>
          <div className="flex">
            <div className="font-bold m-1 p-1">Note</div>
            <div className="border m-1 p-1 rounded-lg break-words">{note}</div>
          </div>
        </button>
      {/* <TaskDialog
        variant="edit"
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        start={start}
        end={end}
        location={location}
        note={note}
        listId={"listId"}
        cardId={"id"}
      /> */}
    </>
  );
};
