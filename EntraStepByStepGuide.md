### Register the web app
To enable your application to sign in users with Microsoft Entra, Microsoft Entra ID for customers must be made aware of the application you create. The app registration establishes a trust relationship between the app and Microsoft Entra. When you register an application, External ID generates a unique identifier known as an **Application (client) ID**, a value used to identify your app when creating authentication requests.

The following steps show you how to register your app in the Microsoft Entra admin center:

1. Sign in to the [Microsoft Entra admin center](https://entra.microsoft.com) as at least an [Application Developer](~/identity/role-based-access-control/permissions-reference.md#application-developer).
2. If you have access to multiple tenants, use the **Settings** icon in the top menu to switch to your customer tenant from the **Directories + subscriptions** menu. 
3. Browse to **Identity** >**Applications** > **App registrations**.
4. Select **+ New registration**.
5. In the **Register an application** page that appears;

    1. Enter a meaningful application **Name** that is displayed to users of the app, for example *ciam-client-app*.
    2. Under **Supported account types**, select **Accounts in this organizational directory only**.

6. Select **Register**.
7. The application's **Overview** pane displays upon successful registration. Record the **Application (client) ID** to be used in your application source code.

To specify your app type to your app registration, follow these steps:

1. Under **Manage**, select **Authentication**.
1. On the **Platform configurations** page, select **Add a platform**, and then select **Web** option.
1. For the **Redirect URIs** enter `http://localhost:3000/auth/redirect`.
1. Select **Configure** to save your changes.

### Add credentials

Credentials are used by [confidential client applications](https://learn.microsoft.com/en-us/entra/identity-platform/msal-client-applications) that access a web API. Credentials allow your application to authenticate as itself, requiring no interaction from a user at runtime.

1. In the Microsoft Entra admin center, in **App registrations**, select your application.
1. Select **Certificates & secrets** > **Client secrets** > **New client secret**.
1. Add a description for your client secret.
1. Select an expiration for the secret or specify a custom lifetime.
    - Client secret lifetime is limited to two years (24 months) or less. You can't specify a custom lifetime longer than 24 months.
    - Microsoft recommends that you set an expiration value of less than 12 months.
1. Select **Add**.
1. _Record the secret's value_ for use in your client application code. This secret value is _never displayed again_ after you leave this page.


### Add permissions to app

Since this app signs-in users, add delegated permissions:
1. From the **App registrations** page, select the application that you created (such as *ciam-client-app*) to open its **Overview** page.
1. Under **Manage**, select **API permissions**.
1. Under **Configured permissions**, select **Add a permission**.
1. Select **Microsoft APIs** tab.
1. Under **Commonly used Microsoft APIs** section, select **Microsoft Graph**.
1. Select **Delegated permissions** option.
1. Under **Select permissions** section, search for and select both **openid** and **offline_access** permissions.
1. Select the **Add permissions** button. 
1. At this point, you've assigned the permissions correctly. However, since the tenant is a customer's tenant, the consumer users themselves can't consent to these permissions. You as the admin must consent to these permissions on behalf of all the users in the tenant:

    1. Select **Grant admin consent for \<your tenant name\>**, then select **Yes**.
    1. Select **Refresh**, then verify that **Granted for \<your tenant name\>** appears under **Status** for both scopes.

### Create a user flow

1. Sign in to the [Microsoft Entra admin center](https://entra.microsoft.com) as at least an [External ID User Flow Administrator](~/identity/role-based-access-control/permissions-reference.md#external-id-user-flow-administrator).  
2. If you have access to multiple tenants, use the **Settings** icon in the top menu to switch to your customer tenant from the **Directories + subscriptions** menu. 
3. Browse to **Identity** > **External Identities** > **User flows**.
4. Select **+ New user flow**.
5. On the **Create** page:

   1. Enter a **Name** for the user flow, such as *SignInSignUpSample*.
   2. In the **Identity providers** list, select **Email Accounts**. This identity provider allows users to sign-in or sign-up using their email address.
    

   3. Under **Email accounts**, you can select one of the two options. For this tutorial, select **Email with password**.

      - **Email with password**: Allows new users to sign up and sign in using an email address as the sign-in name and a password as their first factor credential.  
      - **Email one-time-passcode**: Allows new users to sign up and sign in using an email address as the sign-in name and email one-time passcode as their first factor credential.
  
   4. Under **User attributes**, choose the attributes you want to collect from the user upon sign-up. By selecting **Show more**, you can choose attributes and claims for **Country/Region**, **Display Name**, and **Postal Code**. Select **OK**. (Users are only prompted for attributes when they sign up for the first time.)

6. Select **Create**. The new user flow appears in the **User flows** list. If necessary, refresh the page.

### Associate the web application with the user flow

Although many applications can be associated with your user flow, a single application can only be associated with one user flow. A user flow allows configuration of the user experience for specific applications. For example, you can configure a user flow that requires users to sign-in or sign-up with a phone number or email address.

1. On the sidebar menu, select **Identity**.
1. Select **External Identities**, then **User flows**.
1. In the **User flows** page, select the **User flow name** you created earlier, for example, _SignInSignUpSample_.
1. Under **Use**, select **Applications**.
1. Select **Add application**.
   <!--[Screenshot the shows how to associate an application to a user flow.](media/20-create-user-flow-add-application.png)-->
1. Select the application from the list such as *ciam-client-app* or use the search box to find the application, and then select it.

1. Choose **Select**. 

### Create App Roles

In this step we are going to define the Admin app role, that once assigned to a user will give them elevated access to mange resources that the don't own.
In the Microsoft Entra admin center's user interface:

1. Browse to **Identity** > **Applications** > **App registrations** and then select the application select the application that you created (such as *ciam-client-app*).

1. Under manage select **App roles**, and then select **Create app role**.

2. In the **Create app role** pane, enter the settings for the role. The table following the image describes each setting and their parameters.

  | Field                                    | Description                                                                                                                                                                                                                                                                                                       | Example                       |
   | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
   | **Display name**                         | Display name for the app role that appears in the admin consent and app assignment experiences. This value may contain spaces.                                                                                                                                                                                    | `Administrator`               |
   | **Allowed member types**                 | Specifies whether this app role can be assigned to users, applications, or both.<br/><br/>When available to `applications`, app roles appear as application permissions in an app registration's **Manage** section > **API permissions > Add a permission > My APIs > Choose an API > Application permissions**. | `Users/Groups`                |
   | **Value**                                | Specifies the value of the roles claim that the application should expect in the token. The value should exactly match the string referenced in the application's code. The value can't contain spaces.                                                                                                          | `Posts.Admin`               |
   | **Description**                          | A more detailed description of the app role displayed during admin app assignment and consent experiences.                                                                                                                                                                                                        | `Admins can manage all posts.` |
   | **Do you want to enable this app role?** | Specifies whether the app role is enabled. To delete an app role, deselect this checkbox and apply the change before attempting the delete operation. This setting controls the app role's usage and availability while being able to temporarily or permanently disabling it without removing it entirely.                                                                                                                                                            | _Checked_                     |

1. Select **Apply** to save your changes.

### Assign application owner 

If you have not already done so, you'll need to assign yourself as the application owner.

1. In your app registration, under **Manage**, select **Owners**, and **Add owners**.
1. In the new window, find and select the owner(s) that you want to assign to the application. Selected owners appear in the right panel. Once done, confirm with **Select**. The app owner(s) will now appear in the owner's list.

>[!NOTE]
>
> Ensure that both the API application and the application you want to add permissions to both have an owner, otherwise the API will not be listed when requesting API permissions.

