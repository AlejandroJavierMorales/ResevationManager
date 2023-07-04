import { useEffect } from "react";
//Redux
import {fetchAllUsers} from '../../store/slices/users/index'
import {useDispatch, useSelector } from 'react-redux'


const UserList = () => {


    const dispatch = useDispatch();
    const {list : users} = useSelector(state => state.users)


useEffect(()=>{
   dispatch(fetchAllUsers()) ;
// eslint-disable-next-line react-hooks/exhaustive-deps
},[])

    return (
        <div className="container">
            <div className="row">
                {
                    users.map((user, index) => (
                        <div key={index} className="col-md-3">
                            <div className="card">
                                <img src={user.avatar} alt="avatar" />
                                <div className="card-body">
                                    <h5 className="cadr-title">{`${user.first_name} ${user.last_name}}`}</h5>
                                    <p className="cacrd-text">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>

        </div>
    )

}
export { UserList };