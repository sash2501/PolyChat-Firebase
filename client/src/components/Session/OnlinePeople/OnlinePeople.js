import React from 'react';
import { Stack, IStackTokens} from '@fluentui/react/lib/Stack';
import { IPersonaSharedProps, Persona, PersonaSize, PersonaPresence } from '@fluentui/react/lib/Persona';

import './OnlinePeople.css';

const OnlinePeople = ({ users }) =>  {
  console.log("users:",users);   

  // const userProps: IPersonaSharedProps = {
  //   text: name
  // };          

  return(
    <div className="textContainer">      
      {
        users
          ? (
            <div>
              <div className="activeContainer">
                  <Stack vertical tokens={{childrenGap: 10}}>
                  {users.map(({name}) => (
                    // <div key={name} className="activeItem">
                    //   {name}
                    // </div>
                    <Persona 
                      className="persona"
                      text={name}
                      size={PersonaSize.size48}
                      presence={PersonaPresence.online }
                      onClick={() => {
                          console.log("user in list",name);
                          //store.setIsOpen(true);
                          //console.log("isOpen", store.isOpen);
                      }}                 
                    />
                  ))}
                  </Stack>
              </div>
            </div>
          )
          : <h1>No User</h1>
      }
    </div>
  );
}

export default OnlinePeople;